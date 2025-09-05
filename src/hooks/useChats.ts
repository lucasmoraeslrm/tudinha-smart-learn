
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Chat {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
}

export const useChats = (userId: string) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { studentSession } = useAuth();

  const callStudentChatFunction = async (action: string, payload: any = {}) => {
    const { data, error } = await supabase.functions.invoke('student-chat', {
      body: {
        action,
        token: studentSession?.codigo,
        ...payload
      }
    });

    if (error) throw error;
    return data;
  };

  const loadChats = async () => {
    try {
      if (!studentSession?.codigo) {
        setLoading(false);
        return;
      }

      const data = await callStudentChatFunction('list_chats');
      setChats(data.chats || []);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os chats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createChat = async (title: string = 'Novo chat') => {
    try {
      if (!studentSession?.codigo) {
        toast({
          title: "Erro",
          description: "Sessão de estudante não encontrada",
          variant: "destructive",
        });
        return null;
      }

      const data = await callStudentChatFunction('create_chat', { title });
      const newChat = data.chat;
      
      setChats(prev => [newChat, ...prev]);
      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o chat",
        variant: "destructive",
      });
      return null;
    }
  };

  const renameChat = async (chatId: string, newTitle: string) => {
    try {
      if (!studentSession?.codigo) return;

      await callStudentChatFunction('rename_chat', { chatId, title: newTitle });
      
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      ));
      
      toast({
        title: "Sucesso",
        description: "Chat renomeado com sucesso",
      });
    } catch (error) {
      console.error('Error renaming chat:', error);
      toast({
        title: "Erro",
        description: "Não foi possível renomear o chat",
        variant: "destructive",
      });
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      if (!studentSession?.codigo) return;

      await callStudentChatFunction('delete_chat', { chatId });
      
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      toast({
        title: "Sucesso",
        description: "Chat excluído com sucesso",
      });
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o chat",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (studentSession?.codigo) {
      loadChats();
    }
  }, [studentSession?.codigo]);

  return {
    chats,
    loading,
    createChat,
    renameChat,
    deleteChat,
    refreshChats: loadChats
  };
};
