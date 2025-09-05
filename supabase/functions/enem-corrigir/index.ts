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

    // Check authentication - support both admin users and student sessions
    let isAuthorized = false;
    let currentUserId = null;
    let studentId = null;

    // Try admin authentication first
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (user) {
      // Check if user is admin
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (profile && profile.role === 'admin') {
        isAuthorized = true;
        currentUserId = user.id;
      }
    }

    // If not admin, check for student session in request body
    if (!isAuthorized) {
      const authHeader = req.headers.get('X-Student-Session');
      if (authHeader) {
        try {
          const sessionData = JSON.parse(authHeader);
          if (sessionData.id) {
            studentId = sessionData.id;
            isAuthorized = true;
          }
        } catch (e) {
          console.error('Invalid student session data:', e);
        }
      }
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: 'Unauthorized - admin login or valid student session required' }), {
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

    // Prepare the correction prompt using the new standardized format
    const systemMessage = "Você é um corretor oficial de redações no padrão ENEM. Avalie a redação do aluno com base nas 5 competências do ENEM, atribuindo notas inteiras entre 0 e 200 para cada competência. Some as notas (máximo 1000). Escreva comentários claros, objetivos e respeitosos. Não inclua qualquer texto fora do JSON. Não use Markdown. Não inclua explicações.";

    const tempoMinutos = redacao.tempo_ms ? Math.round(redacao.tempo_ms / 60000) : null;
    
    const userMessage = `Avalie a redação abaixo conforme o padrão ENEM.

Tema:

Título: ${redacao.temas_redacao?.titulo || 'Tema não especificado'}
Descrição: ${redacao.temas_redacao?.texto_motivador || 'Descrição não disponível'}
Textos motivadores: ${redacao.temas_redacao?.texto_motivador || 'Não disponível'}

Redação do aluno: ${redacao.conteudo}

${tempoMinutos ? `Tempo gasto (min): ${tempoMinutos}` : ''}

Retorne APENAS este JSON: { "competencia1": { "nota": 0, "comentario": "..." }, "competencia2": { "nota": 0, "comentario": "..." }, "competencia3": { "nota": 0, "comentario": "..." }, "competencia4": { "nota": 0, "comentario": "..." }, "competencia5": { "nota": 0, "comentario": "..." }, "comentario_geral": "Resumo objetivo com os principais pontos fortes e de melhoria." }`;

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
            content: systemMessage
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_completion_tokens: 1500,
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

    // Calculate total score from individual competencies
    const totalScore = (aiCorrection.competencia1?.nota || 0) +
                      (aiCorrection.competencia2?.nota || 0) +
                      (aiCorrection.competencia3?.nota || 0) +
                      (aiCorrection.competencia4?.nota || 0) +
                      (aiCorrection.competencia5?.nota || 0);

    // Transform to expected format for database storage
    const competenciasFormatted = {
      competencia_1: { 
        nota: aiCorrection.competencia1?.nota || 0, 
        justificativa: aiCorrection.competencia1?.comentario || '' 
      },
      competencia_2: { 
        nota: aiCorrection.competencia2?.nota || 0, 
        justificativa: aiCorrection.competencia2?.comentario || '' 
      },
      competencia_3: { 
        nota: aiCorrection.competencia3?.nota || 0, 
        justificativa: aiCorrection.competencia3?.comentario || '' 
      },
      competencia_4: { 
        nota: aiCorrection.competencia4?.nota || 0, 
        justificativa: aiCorrection.competencia4?.comentario || '' 
      },
      competencia_5: { 
        nota: aiCorrection.competencia5?.nota || 0, 
        justificativa: aiCorrection.competencia5?.comentario || '' 
      }
    };

    // Update the essay with the AI correction
    const { data: updatedRedacao, error: updateError } = await supabaseClient
      .from('redacoes_usuario')
      .update({
        notas: competenciasFormatted,
        feedback: {
          nota_final: totalScore,
          feedback_geral: aiCorrection.comentario_geral || '',
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
      correction: {
        competencias: competenciasFormatted,
        nota_final: totalScore,
        feedback_geral: aiCorrection.comentario_geral || ''
      }
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