import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-student-session',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for database operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get student session from header
    const studentSessionHeader = req.headers.get('X-Student-Session');
    if (!studentSessionHeader) {
      return new Response(JSON.stringify({ error: 'Student session required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const studentSession = JSON.parse(studentSessionHeader);
    let escolaId = studentSession.escola_id;

    // Fallback: fetch escola_id from students table if not provided in the header
    if (!escolaId && studentSession.id) {
      const { data: studentRow } = await supabaseClient
        .from('students')
        .select('escola_id')
        .eq('id', studentSession.id)
        .maybeSingle();
      if (studentRow?.escola_id) {
        escolaId = studentRow.escola_id;
      }
    }

    if (!escolaId) {
      return new Response(JSON.stringify({ error: 'School ID not found in session' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Student session:', studentSession);

    const body = await req.json();
    const { dificuldade = 'medio', categoria_tematica = null } = body;

    // Try to get the webhook URL for this school
    const { data: webhook, error: webhookError } = await supabaseClient
      .from('webhooks')
      .select('*')
      .eq('escola_id', escolaId)
      .eq('tipo', 'gerar_tema')
      .eq('ativo', true)
      .single();

    // If no webhook is configured, fallback to direct OpenAI generation
    if (webhookError || !webhook) {
      console.log('No webhook found, falling back to direct OpenAI generation');
      return await generateThemeDirectly(supabaseClient, dificuldade, categoria_tematica);
    }

    const webhookUrl = webhook.modo_producao ? webhook.url_producao : webhook.url_teste;
    console.log('Using webhook URL:', webhookUrl);

    // Prepare payload for the webhook
    const payload = {
      dificuldade,
      categoria_tematica,
      escola_id: escolaId,
      student_id: studentSession.id,
      timestamp: new Date().toISOString()
    };

    console.log('Sending payload to webhook:', payload);

    // Call the webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...webhook.headers || {}
      },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      console.error('Webhook response not ok:', await webhookResponse.text());
      return new Response(JSON.stringify({ error: 'Webhook call failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const webhookData = await webhookResponse.json();
    console.log('Webhook response:', webhookData);

    // Parse the theme data from webhook response
    let themeData;
    if (webhookData.success && webhookData.resposta) {
      // Handle response wrapped in success/resposta format
      themeData = typeof webhookData.resposta === 'string' 
        ? JSON.parse(webhookData.resposta) 
        : webhookData.resposta;
    } else {
      // Handle direct JSON response
      themeData = webhookData;
    }

    console.log('Parsed theme data:', themeData);

    // Save the generated theme to database
    const { data: newTheme, error: insertError } = await supabaseClient
      .from('temas_redacao')
      .insert({
        titulo: themeData.tema || themeData.titulo,
        texto_motivador: themeData.textos_apoio ? themeData.textos_apoio.join('\n\n') : (themeData.descricao || themeData.texto_motivador),
        ativo: true,
        publica: true,
        competencias: themeData.palavras_chave || []
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

    console.log('Theme saved successfully:', newTheme);

    // Update webhook statistics
    await supabaseClient
      .from('webhooks')
      .update({
        ultimo_disparo: new Date().toISOString(),
        total_disparos: (webhook.total_disparos || 0) + 1,
        ultimo_status: 'sucesso'
      })
      .eq('id', webhook.id);

    return new Response(JSON.stringify({ 
      theme: newTheme,
      generated_data: themeData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gerar-tema-webhook function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Fallback function to generate theme directly using OpenAI
async function generateThemeDirectly(supabaseClient: any, dificuldade: string, categoria_tematica: string | null) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Prepare the theme generation prompt
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
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 1500,
      temperature: 0.7,
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
    generated_data: generatedTheme,
    method: 'direct_openai'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}