import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Module {
  id: string;
  nome: string;
  codigo: string;
  descricao?: string;
  icone?: string;
  ativo: boolean;
}

export function useActiveModules(escolaId: string | null) {
  const [activeModules, setActiveModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!escolaId) {
      setActiveModules([]);
      setLoading(false);
      return;
    }

    const fetchActiveModules = async () => {
      try {
        console.log('Fetching modules for escola_id:', escolaId);
        
        const { data, error } = await supabase
          .from('escola_modulos')
          .select(`
            ativo,
            modulos (
              id,
              nome,
              codigo,
              descricao,
              icone,
              ativo
            )
          `)
          .eq('escola_id', escolaId)
          .eq('ativo', true);

        if (error) {
          console.error('Error fetching active modules:', error);
          setActiveModules([]);
          return;
        }

        console.log('Raw module data:', data);

        const modules = data?.map(item => ({
          ...item.modulos,
          ativo: item.ativo
        })).filter(module => module.ativo) || [];

        console.log('Processed active modules:', modules);
        setActiveModules(modules as Module[]);
      } catch (error) {
        console.error('Error fetching active modules:', error);
        setActiveModules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveModules();
  }, [escolaId]);

  return { activeModules, loading };
}