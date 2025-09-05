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
    if (!studentSession.escola_id) {
      return new Response(JSON.stringify({ error: 'School ID not found in session' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Student session:', studentSession);

    const body = await req.json();
    const { dificuldade = 'medio', categoria_tematica = null } = body;

    // Get the webhook URL for this school
    const { data: webhook, error: webhookError } = await supabaseClient
      .from('webhooks')
      .select('*')
      .eq('escola_id', studentSession.escola_id)
      .eq('tipo', 'gerar_tema')
      .eq('ativo', true)
      .single();

    if (webhookError || !webhook) {
      console.error('Webhook not found:', webhookError);
      return new Response(JSON.stringify({ error: 'Webhook not configured for this school' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const webhookUrl = webhook.modo_producao ? webhook.url_producao : webhook.url_teste;
    console.log('Using webhook URL:', webhookUrl);

    // Prepare payload for the webhook
    const payload = {
      dificuldade,
      categoria_tematica,
      escola_id: studentSession.escola_id,
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