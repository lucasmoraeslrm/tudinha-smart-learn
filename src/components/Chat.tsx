import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'tudinha';
  timestamp: Date;
}

interface ChatProps {
  userName: string;
}

const Chat: React.FC<ChatProps> = ({ userName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Use consistent user and session IDs based on userName to maintain chat history
  const [userId] = useState(() => `user_${userName.toLowerCase().replace(/\s+/g, '_')}`);
  const [sessionId] = useState(() => `session_${userName.toLowerCase().replace(/\s+/g, '_')}`);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load messages from Supabase on component mount
  useEffect(() => {
    loadMessages();
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedMessages = data.map(msg => ({
          id: msg.id,
          text: msg.message,
          sender: msg.sender as 'user' | 'tudinha',
          timestamp: new Date(msg.created_at)
        }));
        setMessages(loadedMessages);
      } else {
        // Add welcome message if no previous messages
        const welcomeMessage: Message = {
          id: '1',
          text: `Oi ${userName}! 👋 Sou a Tudinha, sua tutora de IA! Estou aqui para te ajudar com seus estudos. Sobre qual matéria você gostaria de conversar hoje?`,
          sender: 'tudinha',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
        
        // Save welcome message to database
        await supabase.from('messages').insert({
          user_id: userId,
          session_id: sessionId,
          message: welcomeMessage.text,
          sender: welcomeMessage.sender
        });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const saveMessage = async (message: Message) => {
    try {
      await supabase.from('messages').insert({
        user_id: userId,
        session_id: sessionId,
        message: message.text,
        sender: message.sender
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    // Save user message to database
    await saveMessage(userMessage);

    try {
      // Call n8n webhook with new format
      const response = await fetch('https://tudinha.app.n8n.cloud/webhook/tudinha-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          message: newMessage,
          session_id: sessionId
        }),
      });

      let botResponse = '';
      
      if (response.ok) {
        const data = await response.json();
        // Handle array response format
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
      await saveMessage(botMessage);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-gradient-primary p-4 rounded-t-2xl">
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
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div className={`flex items-start gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-gradient-primary text-primary-foreground'
                }`}>
                  {message.sender === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div className={`rounded-2xl p-3 ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-secondary text-secondary-foreground rounded-bl-md'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' 
                      ? 'text-primary-foreground/70' 
                      : 'text-muted-foreground'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-secondary rounded-2xl rounded-bl-md p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Tudinha está pensando...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua pergunta para a Tudinha..."
            className="flex-1 rounded-xl border-2 border-primary/20 focus:border-primary"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon"
            variant="default"
            disabled={!newMessage.trim() || isLoading}
            className="rounded-xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;