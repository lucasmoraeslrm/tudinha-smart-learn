import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface School {
  id: string;
  nome: string;
  codigo: string;
  dominio?: string;
  logo_url?: string;
  cor_primaria: string;
  cor_secundaria: string;
  cor_primaria_texto?: string;
  cor_secundaria_texto?: string;
  cor_primaria_bg?: string;
  cor_secundaria_bg?: string;
  ativa: boolean;
  plano: string;
  created_at: string;
  updated_at: string;
  nome_fantasia?: string;
  razao_social?: string;
  telefone?: string;
  celular?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  email?: string;
  instancia?: string;
}

export interface Module {
  id: string;
  nome: string;
  codigo: string;
  descricao?: string;
  icone?: string;
  ativo: boolean;
}

export interface SchoolModule {
  id: string;
  escola_id: string;
  modulo_id: string;
  ativo: boolean;
  configuracoes: any;
  modulos: Module;
}

export function useSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('escolas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchools(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar escolas",
        description: error.message
      });
    }
  };

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from('modulos')
        .select('*')
        .order('nome');

      if (error) throw error;
      setModules(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar módulos",
        description: error.message
      });
    }
  };

  const fetchSchoolModules = async (schoolId: string): Promise<SchoolModule[]> => {
    try {
      const { data, error } = await supabase
        .from('escola_modulos')
        .select(`
          *,
          modulos (*)
        `)
        .eq('escola_id', schoolId);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar módulos da escola",
        description: error.message
      });
      return [];
    }
  };

  const createSchool = async (schoolData: Omit<School, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('escolas')
        .insert([schoolData])
        .select()
        .single();

      if (error) throw error;

      // Habilitar todos os módulos para a nova escola
      const { error: moduleError } = await supabase
        .from('escola_modulos')
        .insert(
          modules.map(module => ({
            escola_id: data.id,
            modulo_id: module.id,
            ativo: true
          }))
        );

      if (moduleError) throw moduleError;

      toast({
        title: "Escola criada com sucesso",
        description: `${schoolData.nome} foi adicionada ao sistema`
      });

      await fetchSchools();
      return data;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar escola",
        description: error.message
      });
      throw error;
    }
  };

  const updateSchool = async (id: string, updates: Partial<School>) => {
    try {
    const allowedFields = [
        'nome','codigo','dominio','logo_url','cor_primaria','cor_secundaria','ativa','plano',
        'nome_fantasia','razao_social','telefone','celular','endereco','numero','complemento','bairro','cidade','uf','cep','email','instancia'
      ] as const;
      const sanitizedUpdates = Object.fromEntries(
        Object.entries(updates).filter(([key]) =>
          (allowedFields as readonly string[]).includes(key)
        )
      );

      const { data, error } = await supabase
        .from('escolas')
        .update(sanitizedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Escola atualizada",
        description: "As alterações foram salvas com sucesso"
      });

      await fetchSchools();
      return data;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar escola",
        description: error.message
      });
      throw error;
    }
  };

  const toggleSchoolModule = async (schoolId: string, moduleId: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from('escola_modulos')
        .update({ ativo })
        .eq('escola_id', schoolId)
        .eq('modulo_id', moduleId);

      if (error) throw error;

      toast({
        title: ativo ? "Módulo habilitado" : "Módulo desabilitado",
        description: "A configuração foi atualizada com sucesso"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar módulo",
        description: error.message
      });
      throw error;
    }
  };

  const getSchoolUsers = async (schoolId: string) => {
    try {
      const [profiles, students, professors, coordinators] = await Promise.all([
        supabase.from('profiles').select('*').eq('escola_id', schoolId),
        supabase.from('students').select('*').eq('escola_id', schoolId),
        supabase.from('professores').select('*').eq('escola_id', schoolId),
        supabase.from('coordenadores').select('*').eq('escola_id', schoolId)
      ]);

      return {
        profiles: profiles.data || [],
        students: students.data || [],
        professors: professors.data || [],
        coordinators: coordinators.data || []
      };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar usuários",
        description: error.message
      });
      return {
        profiles: [],
        students: [],
        professors: [],
        coordinators: []
      };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchSchools(), fetchModules()]);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    schools,
    modules,
    loading,
    createSchool,
    updateSchool,
    fetchSchoolModules,
    toggleSchoolModule,
    getSchoolUsers,
    refetch: () => Promise.all([fetchSchools(), fetchModules()])
  };
}