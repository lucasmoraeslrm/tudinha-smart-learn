
import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useChats } from '@/hooks/useChats';
import ChatSidebar from './ChatSidebar';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'tudinha';
  timestamp: Date;
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
}

interface ChatProps {
  userName: string;
}

const Chat: React.FC<ChatProps> = ({ userName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { studentSession } = useAuth();
  const userId = studentSession ? `student_${studentSession.codigo}` : `user_${userName.toLowerCase().replace(/\s+/g, '_')}`;
  
  const { toast } = useToast();
  const { chats, loading: chatsLoading, createChat, renameChat, deleteChat } = useChats(userId);

  // Auto-select first chat or create one if none exists
  useEffect(() => {
    if (!chatsLoading && chats.length > 0 && !selectedChatId) {
      setSelectedChatId(chats[0].id);
    } else if (!chatsLoading && chats.length === 0) {
      handleCreateChat();
    }
  }, [chats, chatsLoading, selectedChatId]);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChatId) {
      loadMessages(selectedChatId);
    }
  }, [selectedChatId]);

  const loadMessages = async (chatId: string) => {
    setIsLoading(true);
    try {
      if (!studentSession?.codigo) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('student-chat', {
        body: {
          action: 'load_messages',
          token: studentSession.codigo,
          chatId
        }
      });

      if (error) throw error;

      // Transform messages to match interface
      const transformedMessages = data.messages.map((msg: any) => ({
        id: msg.id,
        text: msg.message,
        sender: msg.sender as 'user' | 'tudinha',
        timestamp: new Date(msg.created_at),
        attachment_url: msg.attachment_url,
        attachment_type: msg.attachment_type,
        attachment_name: msg.attachment_name,
      }));

      // If no messages and it's a fresh chat, show welcome message
      if (transformedMessages.length === 0) {
        const welcomeMessage: Message = {
          id: 'welcome',
          text: `Oi ${userName}! 👋 Sou a Tudinha, sua tutora de IA! Estou aqui para te ajudar com seus estudos. Sobre qual matéria você gostaria de conversar hoje?`,
          sender: 'tudinha',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      } else {
        setMessages(transformedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleCreateChat = async () => {
    const newChat = await createChat();
    if (newChat) {
      setSelectedChatId(newChat.id);
      setMessages([]);
    }
  };

  const handleSendMessage = async (
    text: string, 
    attachmentUrl?: string, 
    attachmentType?: string, 
    attachmentName?: string
  ) => {
    if (!selectedChatId || !text.trim() || !studentSession?.codigo) return;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date(),
      attachment_url: attachmentUrl,
      attachment_type: attachmentType,
      attachment_name: attachmentName,
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);

    try {
      // Show typing indicator
      setIsLoading(true);

      // Send message through Edge Function (handles saving and webhook call)
      const { data, error } = await supabase.functions.invoke('student-chat', {
        body: {
          action: 'send_message',
          token: studentSession.codigo,
          chatId: selectedChatId,
          text,
          attachmentUrl,
          attachmentType,
          attachmentName
        }
      });

      if (error) throw error;

      // Reload messages to get the updated conversation
      await loadMessages(selectedChatId);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add fallback error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: 'Desculpe, ocorreu um erro. Tente novamente.',
        sender: 'tudinha',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (chatsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Bot className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Carregando seus chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <ChatSidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={setSelectedChatId}
        onCreateChat={handleCreateChat}
        onRenameChat={renameChat}
        onDeleteChat={(chatId) => {
          deleteChat(chatId);
          if (selectedChatId === chatId) {
            const remainingChats = chats.filter(c => c.id !== chatId);
            setSelectedChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
          }
        }}
        loading={chatsLoading}
      />
      
      <div className="flex-1 flex flex-col">
        {selectedChatId ? (
          <>
            {/* Chat Header */}
            <div className="bg-gradient-primary p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-foreground rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-primary-foreground">Tudinha</h2>
                  <p className="text-sm text-primary-foreground/80">IA Tutora • Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ChatMessages messages={messages} isLoading={isLoading} />

            {/* Input */}
            <ChatInput 
              onSendMessage={handleSendMessage}
              disabled={isLoading}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bot className="w-12 h-12 mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Selecione um chat para começar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
