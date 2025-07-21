import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { webhookData } = await req.json()
    
    console.log('Enviando dados para N8N:', webhookData)

    const N8N_WEBHOOK_URL = 'https://n8n.srv863581.hstgr.cloud/webhook/aff2ff16-db64-4463-92ee-285a68f249d3'

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    })

    console.log('Status da resposta N8N:', response.status)

    let responseData = null
    try {
      const textResponse = await response.text()
      console.log('Resposta N8N (texto):', textResponse)
      
      if (textResponse) {
        responseData = JSON.parse(textResponse)
      }
    } catch (parseError) {
      console.log('Erro ao parsear resposta:', parseError)
      // Se não conseguir parsear, deixa como null
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: response.status,
        data: responseData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na função webhook:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})