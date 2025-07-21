export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
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
        ]
      }
      coordenadores: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string
          email: string | null
          funcao: string
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
          funcao: string
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
          funcao?: string
          id?: string
          nome?: string
          password_hash?: string
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
      messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender?: string
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      professores: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string
          email: string | null
          id: string
          materias: string[] | null
          nome: string
          password_hash: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string
          email?: string | null
          id?: string
          materias?: string[] | null
          nome: string
          password_hash: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string
          email?: string | null
          id?: string
          materias?: string[] | null
          nome?: string
          password_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ano_letivo: string | null
          codigo: string | null
          created_at: string
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
            foreignKeyName: "profiles_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
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
        ]
      }
      students: {
        Row: {
          age: number | null
          ano_letivo: string | null
          codigo: string | null
          created_at: string
          email: string | null
          id: string
          maquina_padrao: string | null
          name: string
          turma: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          ano_letivo?: string | null
          codigo?: string | null
          created_at?: string
          email?: string | null
          id?: string
          maquina_padrao?: string | null
          name: string
          turma?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          ano_letivo?: string | null
          codigo?: string | null
          created_at?: string
          email?: string | null
          id?: string
          maquina_padrao?: string | null
          name?: string
          turma?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
