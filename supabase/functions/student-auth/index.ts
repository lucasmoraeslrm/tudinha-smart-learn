import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StudentLoginRequest {
  codigo: string
  password: string
}

interface StudentRegisterRequest {
  codigo: string
  password: string
  name: string
  anoLetivo?: string
  turma?: string
  age?: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    if (action === 'login') {
      const { codigo, password }: StudentLoginRequest = await req.json()

      if (!codigo || !password) {
        return new Response(
          JSON.stringify({ error: 'Código e senha são obrigatórios' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get student data and password hash
      const { data: studentData, error: queryError } = await supabase
        .rpc('verify_student_password', { 
          input_codigo: codigo,
          input_password: password 
        })

      if (queryError || !studentData || studentData.length === 0) {
        console.log('Student not found or query error:', queryError)
        return new Response(
          JSON.stringify({ error: 'Código ou senha inválidos' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const student = studentData[0].student_data

      // Verify password
      const isValidPassword = await bcrypt.compare(password, student.password_hash)
      
      if (!isValidPassword) {
        return new Response(
          JSON.stringify({ error: 'Código ou senha inválidos' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generate simple session token (in production, use proper JWT)
      const sessionToken = btoa(JSON.stringify({
        studentId: student.id,
        codigo: student.codigo,
        timestamp: Date.now()
      }))

      // Return student data without password hash
      const { password_hash, ...safeStudentData } = student

      return new Response(
        JSON.stringify({ 
          success: true,
          student: safeStudentData,
          sessionToken
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (action === 'register') {
      const { codigo, password, name, anoLetivo, turma, age }: StudentRegisterRequest = await req.json()

      if (!codigo || !password || !name) {
        return new Response(
          JSON.stringify({ error: 'Código, senha e nome são obrigatórios' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if student code already exists
      const { data: existingAuth } = await supabase
        .from('student_auth')
        .select('codigo')
        .eq('codigo', codigo)
        .single()

      if (existingAuth) {
        return new Response(
          JSON.stringify({ error: 'Código já está em uso' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password)

      // Create student
      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert({
          name,
          codigo,
          ano_letivo: anoLetivo,
          turma,
          age
        })
        .select()
        .single()

      if (studentError) {
        console.log('Error creating student:', studentError)
        return new Response(
          JSON.stringify({ error: 'Erro ao criar estudante' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create auth record
      const { error: authError } = await supabase
        .from('student_auth')
        .insert({
          codigo,
          password_hash: passwordHash,
          student_id: student.id
        })

      if (authError) {
        console.log('Error creating auth:', authError)
        // Cleanup - delete the student record
        await supabase.from('students').delete().eq('id', student.id)
        
        return new Response(
          JSON.stringify({ error: 'Erro ao criar autenticação' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create profile
      await supabase
        .from('profiles')
        .insert({
          student_id: student.id,
          full_name: name,
          role: 'student',
          codigo,
          ano_letivo: anoLetivo,
          turma
        })

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Estudante criado com sucesso',
          student: {
            id: student.id,
            codigo,
            name,
            ano_letivo: anoLetivo,
            turma,
            role: 'student'
          }
        }),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (action === 'verify') {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({ error: 'Token de autenticação necessário' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      try {
        const token = authHeader.replace('Bearer ', '')
        const sessionData = JSON.parse(atob(token))
        
        // Check if token is not too old (24 hours)
        const tokenAge = Date.now() - sessionData.timestamp
        if (tokenAge > 24 * 60 * 60 * 1000) {
          return new Response(
            JSON.stringify({ error: 'Sessão expirada' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get current student data
        const { data: student, error } = await supabase
          .from('students')
          .select(`
            *,
            profiles(full_name, role)
          `)
          .eq('id', sessionData.studentId)
          .single()

        if (error || !student) {
          return new Response(
            JSON.stringify({ error: 'Estudante não encontrado' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true,
            student: {
              ...student,
              full_name: student.profiles?.full_name || student.name,
              role: student.profiles?.role || 'student'
            }
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Token inválido' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Ação não suportada' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in student-auth function:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})