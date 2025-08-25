
import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
  
  const userId = `user_${userName.toLowerCase().replace(/\s+/g, '_')}`;
  const sessionId = `session_${userName.toLowerCase().replace(/\s+/g, '_')}`;
  
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
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedMessages = data.map(msg => ({
          id: msg.id,
          text: msg.message,
          sender: msg.sender as 'user' | 'tudinha',
          timestamp: new Date(msg.created_at),
          attachment_url: msg.attachment_url,
          attachment_type: msg.attachment_type,
          attachment_name: msg.attachment_name,
        }));
        setMessages(loadedMessages);
      } else {
        // Add welcome message for new chats
        const welcomeMessage: Message = {
          id: '1',
          text: `Oi ${userName}! 👋 Sou a Tudinha, sua tutora de IA! Estou aqui para te ajudar com seus estudos. Sobre qual matéria você gostaria de conversar hoje?`,
          sender: 'tudinha',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
        
        // Save welcome message to database
        await saveMessage(welcomeMessage, chatId);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const saveMessage = async (message: Message, chatId: string) => {
    try {
      await supabase.from('messages').insert({
        chat_id: chatId,
        user_id: userId,
        session_id: sessionId,
        message: message.text,
        sender: message.sender,
        attachment_url: message.attachment_url,
        attachment_type: message.attachment_type,
        attachment_name: message.attachment_name,
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleCreateChat = async () => {
    const newChat = await createChat();
    if (newChat) {
      setSelectedChatId(newChat.id);
      setMessages([]);
    }
  };

  const handleSendMessage = async (text: string, attachmentUrl?: string, attachmentType?: string, attachmentName?: string) => {
    if (!selectedChatId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      attachment_url: attachmentUrl,
      attachment_type: attachmentType,
      attachment_name: attachmentName,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Save user message to database
    await saveMessage(userMessage, selectedChatId);

    try {
      // Call n8n webhook
      const response = await fetch('https://n8n.srv863581.hstgr.cloud/webhook/tudinha-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          message: text,
          session_id: sessionId,
          attachment_url: attachmentUrl,
        }),
      });

      let botResponse = '';
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          botResponse = data[0].resposta || 'Desculpe, não entendi. Pode reformular sua pergunta?';
        } else {
          botResponse = data.resposta || data.response || data.message || 'Desculpe, não entendi. Pode reformular sua pergunta?';
        }
      } else {
        throw new Error('Falha na comunicação');
      }

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'tudinha',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Save bot message to database
      await saveMessage(botMessage, selectedChatId);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Ops! Estou com problemas técnicos no momento. Que tal tentar novamente em alguns instantes? 🤖✨',
        sender: 'tudinha',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, fallbackMessage]);
      
      toast({
        title: "Problema de conexão",
        description: "Não foi possível conectar com a Tudinha. Tente novamente.",
        variant: "destructive",
      });
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
