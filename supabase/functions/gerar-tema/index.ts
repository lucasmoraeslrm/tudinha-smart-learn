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

    // Check admin authorization
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (!profile || profile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { dificuldade = 'medio', categoria_tematica = null } = body;

    // Prepare the theme generation prompt using the new standardized format
    const systemMessage = "Você é um elaborador de propostas de redação no estilo ENEM. Gere um tema autoral, com textos motivadores curtos e um comando de redação claro. Não use Markdown. Não inclua texto fora do JSON.";

    const userMessage = `Gere um tema de redação autoral com os seguintes parâmetros:

Dificuldade: ${dificuldade}
${categoria_tematica ? `Categoria temática: ${categoria_tematica}` : ''}

Retorne APENAS este JSON: { "tema": "Título do tema (claro e específico)", "descricao": "Comando de redação objetivo, no estilo ENEM, dizendo ao aluno o que fazer.", "textos_apoio": [ "Texto motivador I (2-6 linhas, com dado, fato ou citação)", "Texto motivador II (2-6 linhas, com perspectiva complementar)" ], "orientacao": "Com base na leitura dos textos motivadores seguintes e nos conhecimentos construídos ao longo de sua formação, redija texto dissertativo-argumentativo em modalidade escrita formal da língua portuguesa sobre o tema apresentado, apresentando proposta de intervenção, que respeite os direitos humanos.", "palavras_chave": ["termo1", "termo2", "termo3", "termo4", "termo5"], "categoria_tematica": "${categoria_tematica || 'geral'}" }`;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
    const generatedTheme = JSON.parse(openaiData.choices[0].message.content);

    // Save the generated theme to database
    const { data: newTheme, error: insertError } = await supabaseClient
      .from('temas_redacao')
      .insert({
        titulo: generatedTheme.tema,
        texto_motivador: generatedTheme.textos_apoio ? generatedTheme.textos_apoio.join('\n\n') : generatedTheme.descricao,
        ativo: true,
        publica: true,
        competencias: generatedTheme.palavras_chave || []
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving theme:', insertError);
      return new Response(JSON.stringify({ error: 'Error saving theme to database' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      theme: newTheme,
      generated_data: generatedTheme
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gerar-tema function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});