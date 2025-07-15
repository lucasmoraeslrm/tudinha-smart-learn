import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const requestData = await req.json();
    console.log('Received request data:', JSON.stringify(requestData, null, 2));

    const { 
      aluno, 
      mensagem_admin, 
      user_id 
    } = requestData;

    if (!aluno || !mensagem_admin || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: aluno, mensagem_admin, or user_id' }), 
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get admin info
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('user_id', user_id)
      .single();

    if (adminError || !adminProfile) {
      console.error('Error fetching admin profile:', adminError);
      return new Response(
        JSON.stringify({ error: 'Admin not found or unauthorized' }), 
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (adminProfile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: User is not an admin' }), 
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Prepare data for AI analysis
    const studentData = {
      nome: aluno.nome,
      codigo: aluno.codigo,
      email: aluno.email,
      estatisticas: aluno.estatisticas,
      ultimos_exercicios: aluno.ultimos_exercicios
    };

    // Create a comprehensive prompt for the AI
    const systemPrompt = `Você é uma IA educacional especializada em análise de desempenho de estudantes. 
    Você está ajudando um administrador escolar (${adminProfile.full_name}) a entender melhor o desempenho de um aluno.
    
    Analise os dados do aluno de forma detalhada e profissional, fornecendo insights educacionais úteis.
    Responda em português brasileiro de forma clara e construtiva.`;

    const userPrompt = `Admin ${adminProfile.full_name} pergunta: "${mensagem_admin}"

Dados do aluno:
- Nome: ${studentData.nome}
- Código: ${studentData.codigo}
- Email: ${studentData.email}
- Estatísticas:
  * Acertos: ${studentData.estatisticas.acertos}
  * Erros: ${studentData.estatisticas.erros}
  * Taxa de acerto: ${studentData.estatisticas.porcentagem_acerto}%

Últimos exercícios:
${studentData.ultimos_exercicios.map((ex: any, i: number) => 
  `${i + 1}. Pergunta: "${ex.pergunta}"
     Resposta: "${ex.resposta}"
     Correto: ${ex.correto ? 'Sim' : 'Não'}
     Data: ${new Date(ex.data).toLocaleString('pt-BR')}`
).join('\n')}

Por favor, forneça uma análise detalhada baseada na pergunta do administrador.`;

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API Error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to get AI response' }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const aiData = await openAIResponse.json();
    const aiResponse = aiData.choices[0].message.content;

    // Log the interaction for audit purposes
    console.log(`Admin ${adminProfile.full_name} (${user_id}) requested analysis for student ${studentData.nome}`);
    console.log(`Message: "${mensagem_admin}"`);
    console.log(`AI Response: "${aiResponse}"`);

    // Return the AI response
    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        admin_id: user_id,
        admin_name: adminProfile.full_name,
        student_name: studentData.nome,
        timestamp: new Date().toISOString()
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in admin-chat function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});