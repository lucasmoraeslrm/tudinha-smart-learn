import { supabase } from '@/integrations/supabase/client';

// Normaliza série para comparação consistente
export const normalizeSerie = (serie: string | null | undefined): string => {
  if (!serie) return '';
  
  return serie
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\bs[ée]rie\b/g, 'ano') // Substitui "série" por "ano"
    .replace(/\s+/g, ' ') // Remove espaços múltiplos
    .trim();
};

export const getAlunoSerie = async (): Promise<string | null> => {
  try {
    // Primeiro tenta via RPC
    const { data, error } = await supabase
      .rpc('get_current_student_serie_normalized');

    if (!error && data) {
      console.debug('Série obtida via RPC:', data);
      return data;
    }

    console.debug('RPC falhou ou retornou null, tentando localStorage...', error);

    // Fallback: busca do localStorage
    const studentSession = localStorage.getItem('student_session');
    if (studentSession) {
      try {
        const student = JSON.parse(studentSession);
        if (student.ano_letivo) {
          const serieNormalizada = normalizeSerie(student.ano_letivo);
          console.debug('Série obtida do localStorage:', student.ano_letivo, '-> normalizada:', serieNormalizada);
          return serieNormalizada;
        }
      } catch (parseError) {
        console.error('Erro ao parsear student_session:', parseError);
      }
    }

    console.debug('Nenhuma série encontrada');
    return null;
  } catch (error) {
    console.error('Erro ao obter série normalizada do aluno:', error);
    return null;
  }
};