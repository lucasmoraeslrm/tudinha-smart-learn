import { supabase } from '@/integrations/supabase/client';

export const getAlunoSerie = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .rpc('get_current_student_serie_normalized');

    if (error) {
      console.error('Erro ao buscar série do aluno:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao obter série normalizada do aluno:', error);
    return null;
  }
};