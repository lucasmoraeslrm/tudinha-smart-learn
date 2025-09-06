import { supabase } from '@/integrations/supabase/client';

export const getAlunoSerie = async (studentId: string): Promise<string | null> => {
  try {
    // Buscar dados do aluno
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('turma_id, ano_letivo')
      .eq('id', studentId)
      .single();

    if (studentError || !studentData) {
      console.error('Erro ao buscar dados do aluno:', studentError);
      return null;
    }

    // Se tiver turma_id, buscar a série da turma
    if (studentData.turma_id) {
      const { data: turmaData, error: turmaError } = await supabase
        .from('turmas')
        .select('serie')
        .eq('id', studentData.turma_id)
        .single();

      if (!turmaError && turmaData?.serie) {
        return turmaData.serie;
      }
    }

    // Fallback: usar ano_letivo do aluno
    return studentData.ano_letivo || null;
  } catch (error) {
    console.error('Erro ao obter série do aluno:', error);
    return null;
  }
};