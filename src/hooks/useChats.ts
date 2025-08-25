
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  const loadChats = async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setChats(data || []);
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
      const { data, error } = await supabase
        .from('chats')
        .insert([{ user_id: userId, title }])
        .select()
        .single();

      if (error) throw error;
      
      setChats(prev => [data, ...prev]);
      return data;
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
      const { error } = await supabase
        .from('chats')
        .update({ title: newTitle })
        .eq('id', chatId);

      if (error) throw error;
      
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
      const { error } = await supabase
        .from('chats')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', chatId);

      if (error) throw error;
      
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
    loadChats();
  }, [userId]);

  return {
    chats,
    loading,
    createChat,
    renameChat,
    deleteChat,
    refreshChats: loadChats
  };
};
