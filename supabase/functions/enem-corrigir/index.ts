import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { redacao_id, escola_id } = body;

    if (!redacao_id || !escola_id) {
      return new Response(JSON.stringify({ error: 'redacao_id and escola_id are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get AI configuration for the school
    const { data: config, error: configError } = await supabaseClient
      .from('ai_enem_config')
      .select('*')
      .eq('escola_id', escola_id)
      .eq('ativo', true)
      .single();

    if (configError || !config) {
      return new Response(JSON.stringify({ error: 'AI configuration not found for this school' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the essay content
    const { data: redacao, error: redacaoError } = await supabaseClient
      .from('redacoes_usuario')
      .select(`
        *,
        temas_redacao:tema_id (
          titulo,
          texto_motivador
        )
      `)
      .eq('id', redacao_id)
      .single();

    if (redacaoError || !redacao) {
      return new Response(JSON.stringify({ error: 'Essay not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare prompt for OpenAI
    const fullPrompt = `${config.prompt_correcao}

Tema da redação: ${redacao.temas_redacao?.titulo || 'Não especificado'}
${redacao.temas_redacao?.texto_motivador ? `Texto motivador: ${redacao.temas_redacao.texto_motivador}` : ''}

Redação do aluno:
${redacao.conteudo}

Forneça a resposta em formato JSON com a seguinte estrutura:
{
  "competencias": {
    "competencia_1": {"nota": 0-200, "justificativa": "texto"},
    "competencia_2": {"nota": 0-200, "justificativa": "texto"}, 
    "competencia_3": {"nota": 0-200, "justificativa": "texto"},
    "competencia_4": {"nota": 0-200, "justificativa": "texto"},
    "competencia_5": {"nota": 0-200, "justificativa": "texto"}
  },
  "nota_final": 0-1000,
  "feedback_geral": "texto com feedback geral sobre a redação"
}`;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.modelo_openai,
        messages: [
          {
            role: 'system',
            content: 'Você é um corretor especialista em redações do ENEM. Analise cuidadosamente cada competência e forneça notas e feedback detalhado.'
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        max_completion_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      return new Response(JSON.stringify({ error: 'Error calling OpenAI API' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openaiData = await openaiResponse.json();
    const aiCorrection = JSON.parse(openaiData.choices[0].message.content);

    // Update the essay with the AI correction
    const { data: updatedRedacao, error: updateError } = await supabaseClient
      .from('redacoes_usuario')
      .update({
        notas: aiCorrection.competencias,
        feedback: {
          nota_final: aiCorrection.nota_final,
          feedback_geral: aiCorrection.feedback_geral,
          corrigida_em: new Date().toISOString(),
          modelo_usado: config.modelo_openai
        },
        status: 'corrigida'
      })
      .eq('id', redacao_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating essay:', updateError);
      return new Response(JSON.stringify({ error: 'Error updating essay' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      data: updatedRedacao,
      correction: aiCorrection
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enem-corrigir function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});