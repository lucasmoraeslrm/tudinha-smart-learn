export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_chat_logs: {
        Row: {
          admin_message: string
          ai_response: string
          created_at: string
          id: string
          student_id: string
        }
        Insert: {
          admin_message: string
          ai_response: string
          created_at?: string
          id?: string
          student_id: string
        }
        Update: {
          admin_message?: string
          ai_response?: string
          created_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_chat_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_chat_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_jornadas_overview"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "admin_chat_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_performance"
            referencedColumns: ["student_id"]
          },
        ]
      }
      aluno_tutor: {
        Row: {
          aluno_id: string | null
          created_at: string
          id: string
          tutor_id: string | null
        }
        Insert: {
          aluno_id?: string | null
          created_at?: string
          id?: string
          tutor_id?: string | null
        }
        Update: {
          aluno_id?: string | null
          created_at?: string
          id?: string
          tutor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aluno_tutor_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aluno_tutor_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "v_jornadas_overview"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "aluno_tutor_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "v_student_performance"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "aluno_tutor_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutores"
            referencedColumns: ["id"]
          },
        ]
      }
      aulas_programadas: {
        Row: {
          assunto: string | null
          ativa: boolean | null
          created_at: string
          data_hora_fim: string
          data_hora_inicio: string
          duracao_minutos: number | null
          id: string
          materia: string
          professor_id: string | null
          titulo: string
          turma: string | null
        }
        Insert: {
          assunto?: string | null
          ativa?: boolean | null
          created_at?: string
          data_hora_fim: string
          data_hora_inicio: string
          duracao_minutos?: number | null
          id?: string
          materia: string
          professor_id?: string | null
          titulo: string
          turma?: string | null
        }
        Update: {
          assunto?: string | null
          ativa?: boolean | null
          created_at?: string
          data_hora_fim?: string
          data_hora_inicio?: string
          duracao_minutos?: number | null
          id?: string
          materia?: string
          professor_id?: string | null
          titulo?: string
          turma?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aulas_programadas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aulas_programadas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "v_professor_materias_turmas"
            referencedColumns: ["professor_id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          last_message_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          last_message_at?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          last_message_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coordenadores: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string
          email: string | null
          escola_id: string | null
          funcao: string
          id: string
          nome: string
          password_hash: string
          permissoes: Json | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string
          email?: string | null
          escola_id?: string | null
          funcao: string
          id?: string
          nome: string
          password_hash: string
          permissoes?: Json | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string
          email?: string | null
          escola_id?: string | null
          funcao?: string
          id?: string
          nome?: string
          password_hash?: string
          permissoes?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coordenadores_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      escola_modulos: {
        Row: {
          ativo: boolean
          configuracoes: Json | null
          created_at: string
          escola_id: string
          id: string
          modulo_id: string
        }
        Insert: {
          ativo?: boolean
          configuracoes?: Json | null
          created_at?: string
          escola_id: string
          id?: string
          modulo_id: string
        }
        Update: {
          ativo?: boolean
          configuracoes?: Json | null
          created_at?: string
          escola_id?: string
          id?: string
          modulo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "escola_modulos_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escola_modulos_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      escolas: {
        Row: {
          ativa: boolean
          bairro: string | null
          celular: string | null
          cep: string | null
          cidade: string | null
          codigo: string
          complemento: string | null
          cor_primaria: string | null
          cor_secundaria: string | null
          created_at: string
          dominio: string | null
          email: string | null
          endereco: string | null
          id: string
          logo_url: string | null
          nome: string
          nome_fantasia: string | null
          numero: string | null
          plano: string
          razao_social: string | null
          telefone: string | null
          uf: string | null
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          bairro?: string | null
          celular?: string | null
          cep?: string | null
          cidade?: string | null
          codigo: string
          complemento?: string | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string
          dominio?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          nome_fantasia?: string | null
          numero?: string | null
          plano?: string
          razao_social?: string | null
          telefone?: string | null
          uf?: string | null
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          bairro?: string | null
          celular?: string | null
          cep?: string | null
          cidade?: string | null
          codigo?: string
          complemento?: string | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string
          dominio?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          nome_fantasia?: string | null
          numero?: string | null
          plano?: string
          razao_social?: string | null
          telefone?: string | null
          uf?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      exercise_collections: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          materia: string
          serie_escolar: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          materia: string
          serie_escolar: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          materia?: string
          serie_escolar?: string
          updated_at?: string
        }
        Relationships: []
      }
      exercise_lists: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string | null
          exercise_ids: string[]
          id: string
          subject: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          exercise_ids: string[]
          id?: string
          subject: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          exercise_ids?: string[]
          id?: string
          subject?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      exercise_topics: {
        Row: {
          assunto: string
          collection_id: string
          created_at: string
          id: string
          ordem: number
        }
        Insert: {
          assunto: string
          collection_id: string
          created_at?: string
          id?: string
          ordem?: number
        }
        Update: {
          assunto?: string
          collection_id?: string
          created_at?: string
          id?: string
          ordem?: number
        }
        Relationships: [
          {
            foreignKeyName: "exercise_topics_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "exercise_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          correct_answer: string
          created_at: string
          difficulty: string | null
          explanation: string | null
          id: string
          nivel_dificuldade: string | null
          options: Json | null
          question: string
          subject: string
          title: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          id?: string
          nivel_dificuldade?: string | null
          options?: Json | null
          question: string
          subject: string
          title: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          id?: string
          nivel_dificuldade?: string | null
          options?: Json | null
          question?: string
          subject?: string
          title?: string
        }
        Relationships: []
      }
      interacoes_jornada_n8n: {
        Row: {
          criada_em: string | null
          etapa: string
          id: number
          jornada_id: string | null
          mensagem_aluno: string | null
          mensagem_professor: string | null
          resposta_ia: string | null
        }
        Insert: {
          criada_em?: string | null
          etapa: string
          id?: never
          jornada_id?: string | null
          mensagem_aluno?: string | null
          mensagem_professor?: string | null
          resposta_ia?: string | null
        }
        Update: {
          criada_em?: string | null
          etapa?: string
          id?: never
          jornada_id?: string | null
          mensagem_aluno?: string | null
          mensagem_professor?: string | null
          resposta_ia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interacoes_jornada_n8n_jornada_id_fkey"
            columns: ["jornada_id"]
            isOneToOne: false
            referencedRelation: "jornadas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interacoes_jornada_n8n_jornada_id_fkey"
            columns: ["jornada_id"]
            isOneToOne: false
            referencedRelation: "v_jornadas_overview"
            referencedColumns: ["jornada_id"]
          },
        ]
      }
      jornada_exercises: {
        Row: {
          correct_answer: string
          created_at: string
          difficulty: string | null
          explanation: string | null
          id: string
          options: Json | null
          ordem: number
          question: string
          subject: string
          title: string
          updated_at: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          ordem?: number
          question: string
          subject: string
          title: string
          updated_at?: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          ordem?: number
          question?: string
          subject?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      jornadas: {
        Row: {
          assunto: string | null
          aula_titulo: string
          created_at: string
          exercise_ids: string[] | null
          fim_previsto: string | null
          fim_real: string | null
          id: string
          inicio_previsto: string | null
          inicio_real: string | null
          materia: string
          professor_nome: string | null
          resultado_exercicio: Json | null
          resumo_inicial: string | null
          serie_ano_letivo: string | null
          serie_turma: string | null
          status: string | null
          student_id: string | null
          tempo_resumo_segundos: number | null
          updated_at: string
        }
        Insert: {
          assunto?: string | null
          aula_titulo: string
          created_at?: string
          exercise_ids?: string[] | null
          fim_previsto?: string | null
          fim_real?: string | null
          id?: string
          inicio_previsto?: string | null
          inicio_real?: string | null
          materia: string
          professor_nome?: string | null
          resultado_exercicio?: Json | null
          resumo_inicial?: string | null
          serie_ano_letivo?: string | null
          serie_turma?: string | null
          status?: string | null
          student_id?: string | null
          tempo_resumo_segundos?: number | null
          updated_at?: string
        }
        Update: {
          assunto?: string | null
          aula_titulo?: string
          created_at?: string
          exercise_ids?: string[] | null
          fim_previsto?: string | null
          fim_real?: string | null
          id?: string
          inicio_previsto?: string | null
          inicio_real?: string | null
          materia?: string
          professor_nome?: string | null
          resultado_exercicio?: Json | null
          resumo_inicial?: string | null
          serie_ano_letivo?: string | null
          serie_turma?: string | null
          status?: string | null
          student_id?: string | null
          tempo_resumo_segundos?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jornadas_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jornadas_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_jornadas_overview"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "jornadas_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_performance"
            referencedColumns: ["student_id"]
          },
        ]
      }
      login_logs: {
        Row: {
          id: string
          ip_address: string | null
          login_time: string
          logout_time: string | null
          maquina_codigo: string | null
          status: string | null
          student_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: string | null
          login_time?: string
          logout_time?: string | null
          maquina_codigo?: string | null
          status?: string | null
          student_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: string | null
          login_time?: string
          logout_time?: string | null
          maquina_codigo?: string | null
          status?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "login_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "login_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_jornadas_overview"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "login_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_performance"
            referencedColumns: ["student_id"]
          },
        ]
      }
      maquinas: {
        Row: {
          codigo: string
          created_at: string
          id: string
          ip_address: string | null
          nome: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          codigo: string
          created_at?: string
          id?: string
          ip_address?: string | null
          nome?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          codigo?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          nome?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      materias: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          descricao: string | null
          escola_id: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          descricao?: string | null
          escola_id?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          descricao?: string | null
          escola_id?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materias_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_name: string | null
          attachment_type: string | null
          attachment_url: string | null
          chat_id: string | null
          created_at: string
          id: string
          message: string
          sender: string
          session_id: string
          user_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          chat_id?: string | null
          created_at?: string
          id?: string
          message: string
          sender: string
          session_id: string
          user_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          chat_id?: string | null
          created_at?: string
          id?: string
          message?: string
          sender?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      modulos: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          descricao: string | null
          icone: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      professor_materia_turma: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          materia_id: string | null
          professor_id: string | null
          turma_id: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          materia_id?: string | null
          professor_id?: string | null
          turma_id?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          materia_id?: string | null
          professor_id?: string | null
          turma_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professor_materia_turma_materia_id_fkey"
            columns: ["materia_id"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professor_materia_turma_materia_id_fkey"
            columns: ["materia_id"]
            isOneToOne: false
            referencedRelation: "v_professor_materias_turmas"
            referencedColumns: ["materia_id"]
          },
          {
            foreignKeyName: "professor_materia_turma_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professor_materia_turma_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "v_professor_materias_turmas"
            referencedColumns: ["professor_id"]
          },
          {
            foreignKeyName: "professor_materia_turma_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professor_materia_turma_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "v_professor_materias_turmas"
            referencedColumns: ["turma_id"]
          },
        ]
      }
      professores: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string
          email: string | null
          escola_id: string | null
          id: string
          nome: string
          password_hash: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string
          email?: string | null
          escola_id?: string | null
          id?: string
          nome: string
          password_hash: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string
          email?: string | null
          escola_id?: string | null
          id?: string
          nome?: string
          password_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professores_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ano_letivo: string | null
          codigo: string | null
          created_at: string
          escola_id: string | null
          full_name: string | null
          id: string
          role: string
          student_id: string | null
          turma: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ano_letivo?: string | null
          codigo?: string | null
          created_at?: string
          escola_id?: string | null
          full_name?: string | null
          id?: string
          role?: string
          student_id?: string | null
          turma?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ano_letivo?: string | null
          codigo?: string | null
          created_at?: string
          escola_id?: string | null
          full_name?: string | null
          id?: string
          role?: string
          student_id?: string | null
          turma?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_jornadas_overview"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "profiles_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_performance"
            referencedColumns: ["student_id"]
          },
        ]
      }
      series_anos_letivos: {
        Row: {
          ano_letivo: string
          ativo: boolean
          created_at: string
          escola_id: string
          id: string
          serie: string
          updated_at: string
        }
        Insert: {
          ano_letivo: string
          ativo?: boolean
          created_at?: string
          escola_id: string
          id?: string
          serie: string
          updated_at?: string
        }
        Update: {
          ano_letivo?: string
          ativo?: boolean
          created_at?: string
          escola_id?: string
          id?: string
          serie?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_answers: {
        Row: {
          answered_at: string
          exercise_id: string | null
          id: string
          is_correct: boolean
          list_id: string | null
          student_id: string | null
          user_answer: string
        }
        Insert: {
          answered_at?: string
          exercise_id?: string | null
          id?: string
          is_correct: boolean
          list_id?: string | null
          student_id?: string | null
          user_answer: string
        }
        Update: {
          answered_at?: string
          exercise_id?: string | null
          id?: string
          is_correct?: boolean
          list_id?: string | null
          student_id?: string | null
          user_answer?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_answers_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_answers_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "v_exercises_catalog"
            referencedColumns: ["exercise_id"]
          },
          {
            foreignKeyName: "student_answers_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "exercise_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_answers_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_answers_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_jornadas_overview"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_answers_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_performance"
            referencedColumns: ["student_id"]
          },
        ]
      }
      student_auth: {
        Row: {
          codigo: string
          created_at: string
          id: string
          password_hash: string
          student_id: string | null
          updated_at: string
        }
        Insert: {
          codigo: string
          created_at?: string
          id?: string
          password_hash: string
          student_id?: string | null
          updated_at?: string
        }
        Update: {
          codigo?: string
          created_at?: string
          id?: string
          password_hash?: string
          student_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_auth_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_auth_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_jornadas_overview"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_auth_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_student_performance"
            referencedColumns: ["student_id"]
          },
        ]
      }
      student_exercise_sessions: {
        Row: {
          created_at: string
          finished_at: string | null
          id: string
          score: number | null
          started_at: string
          student_id: string
          topic_id: string
          total_questions: number | null
          total_time_seconds: number | null
        }
        Insert: {
          created_at?: string
          finished_at?: string | null
          id?: string
          score?: number | null
          started_at?: string
          student_id: string
          topic_id: string
          total_questions?: number | null
          total_time_seconds?: number | null
        }
        Update: {
          created_at?: string
          finished_at?: string | null
          id?: string
          score?: number | null
          started_at?: string
          student_id?: string
          topic_id?: string
          total_questions?: number | null
          total_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_exercise_sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "exercise_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      student_question_responses: {
        Row: {
          answered_at: string
          exercise_id: string
          id: string
          is_correct: boolean
          session_id: string
          student_answer: string
          time_spent_seconds: number
        }
        Insert: {
          answered_at?: string
          exercise_id: string
          id?: string
          is_correct: boolean
          session_id: string
          student_answer: string
          time_spent_seconds: number
        }
        Update: {
          answered_at?: string
          exercise_id?: string
          id?: string
          is_correct?: boolean
          session_id?: string
          student_answer?: string
          time_spent_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_question_responses_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "topic_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_question_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "student_exercise_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          age: number | null
          ano_letivo: string | null
          ativo: boolean
          codigo: string | null
          created_at: string
          data_nascimento: string | null
          email: string | null
          escola_id: string | null
          id: string
          maquina_padrao: string | null
          name: string
          password_hash: string | null
          ra: string | null
          turma: string | null
          turma_id: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          ano_letivo?: string | null
          ativo?: boolean
          codigo?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          escola_id?: string | null
          id?: string
          maquina_padrao?: string | null
          name: string
          password_hash?: string | null
          ra?: string | null
          turma?: string | null
          turma_id?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          ano_letivo?: string | null
          ativo?: boolean
          codigo?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          escola_id?: string | null
          id?: string
          maquina_padrao?: string | null
          name?: string
          password_hash?: string | null
          ra?: string | null
          turma?: string | null
          turma_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "v_professor_materias_turmas"
            referencedColumns: ["turma_id"]
          },
        ]
      }
      topic_exercises: {
        Row: {
          alternativas: Json
          created_at: string
          enunciado: string
          explicacao: string | null
          id: string
          ordem: number
          resposta_correta: string
          topic_id: string
        }
        Insert: {
          alternativas: Json
          created_at?: string
          enunciado: string
          explicacao?: string | null
          id?: string
          ordem?: number
          resposta_correta: string
          topic_id: string
        }
        Update: {
          alternativas?: Json
          created_at?: string
          enunciado?: string
          explicacao?: string | null
          id?: string
          ordem?: number
          resposta_correta?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_exercises_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "exercise_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas: {
        Row: {
          ano_letivo: string
          ativo: boolean
          codigo: string
          created_at: string
          escola_id: string | null
          id: string
          nome: string
          serie: string
          updated_at: string
        }
        Insert: {
          ano_letivo: string
          ativo?: boolean
          codigo: string
          created_at?: string
          escola_id?: string | null
          id?: string
          nome: string
          serie: string
          updated_at?: string
        }
        Update: {
          ano_letivo?: string
          ativo?: boolean
          codigo?: string
          created_at?: string
          escola_id?: string | null
          id?: string
          nome?: string
          serie?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "turmas_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      tutores: {
        Row: {
          ativo: boolean
          created_at: string
          email: string | null
          escola_id: string | null
          id: string
          nome: string
          password_hash: string
          telefone: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          escola_id?: string | null
          id?: string
          nome: string
          password_hash: string
          telefone?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          escola_id?: string | null
          id?: string
          nome?: string
          password_hash?: string
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutores_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          ativo: boolean
          configuracoes: Json | null
          created_at: string
          escola_id: string | null
          headers: Json | null
          id: string
          modo_producao: boolean
          nome: string
          tipo: string
          total_disparos: number | null
          ultimo_disparo: string | null
          ultimo_status: string | null
          updated_at: string
          url_producao: string
          url_teste: string
        }
        Insert: {
          ativo?: boolean
          configuracoes?: Json | null
          created_at?: string
          escola_id?: string | null
          headers?: Json | null
          id?: string
          modo_producao?: boolean
          nome: string
          tipo: string
          total_disparos?: number | null
          ultimo_disparo?: string | null
          ultimo_status?: string | null
          updated_at?: string
          url_producao: string
          url_teste: string
        }
        Update: {
          ativo?: boolean
          configuracoes?: Json | null
          created_at?: string
          escola_id?: string | null
          headers?: Json | null
          id?: string
          modo_producao?: boolean
          nome?: string
          tipo?: string
          total_disparos?: number | null
          ultimo_disparo?: string | null
          ultimo_status?: string | null
          updated_at?: string
          url_producao?: string
          url_teste?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_escola_usuarios: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          escola_codigo: string | null
          escola_id: string | null
          escola_nome: string | null
          tipo_usuario: string | null
          usuario_codigo: string | null
          usuario_email: string | null
          usuario_id: string | null
          usuario_nome: string | null
        }
        Relationships: []
      }
      v_exercises_catalog: {
        Row: {
          correct_answer: string | null
          correct_attempts: number | null
          created_at: string | null
          difficulty: string | null
          exercise_id: string | null
          explanation: string | null
          nivel_dificuldade: string | null
          options: Json | null
          question: string | null
          subject: string | null
          success_rate_percent: number | null
          title: string | null
          total_attempts: number | null
        }
        Relationships: []
      }
      v_jornadas_overview: {
        Row: {
          ano_letivo: string | null
          assunto: string | null
          aula_titulo: string | null
          escola_codigo: string | null
          escola_nome: string | null
          exercise_ids: string[] | null
          fim_previsto: string | null
          fim_real: string | null
          inicio_previsto: string | null
          inicio_real: string | null
          jornada_criada_em: string | null
          jornada_id: string | null
          materia: string | null
          professor_nome: string | null
          serie: string | null
          status: string | null
          student_codigo: string | null
          student_id: string | null
          student_nome: string | null
          student_ra: string | null
          tempo_resumo_segundos: number | null
          total_exercicios: number | null
          turma_nome: string | null
        }
        Relationships: []
      }
      v_professor_materias_turmas: {
        Row: {
          ano_letivo: string | null
          ativo: boolean | null
          atribuicao_criada_em: string | null
          escola_codigo: string | null
          escola_id: string | null
          escola_nome: string | null
          materia_codigo: string | null
          materia_id: string | null
          materia_nome: string | null
          professor_codigo: string | null
          professor_email: string | null
          professor_id: string | null
          professor_nome: string | null
          serie: string | null
          turma_codigo: string | null
          turma_id: string | null
          turma_nome: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professores_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      v_student_performance: {
        Row: {
          escola_nome: string | null
          jornadas_concluidas: number | null
          jornadas_em_andamento: number | null
          ra: string | null
          respostas_corretas: number | null
          student_codigo: string | null
          student_id: string | null
          student_nome: string | null
          taxa_acerto_percent: number | null
          total_jornadas: number | null
          total_respostas: number | null
          turma_nome: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_professor_students: {
        Args: { professor_codigo: string }
        Returns: {
          materia_nome: string
          student_id: string
          student_name: string
          student_ra: string
          turma_nome: string
        }[]
      }
      pmt_is_same_school: {
        Args: { _materia_id: string; _professor_id: string; _turma_id: string }
        Returns: boolean
      }
      professor_can_view_student: {
        Args: { professor_codigo: string; student_id: string }
        Returns: boolean
      }
      promote_to_admin: {
        Args: { user_email: string }
        Returns: Json
      }
      verify_coordenador_password: {
        Args: { input_codigo: string; input_password: string }
        Returns: {
          coordenador_data: Json
        }[]
      }
      verify_professor_password: {
        Args: { input_codigo: string; input_password: string }
        Returns: {
          professor_data: Json
        }[]
      }
      verify_student_password: {
        Args: { input_codigo: string; input_password: string }
        Returns: {
          student_data: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
