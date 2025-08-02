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

    const N8N_WEBHOOK_URL = 'https://n8n.srv863581.hstgr.cloud/webhook/dea013f8-8c32-4c58-bd34-e0aaf2f0007a'

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
      console.log('Resposta N8N (texto completo):', textResponse)
      
      if (textResponse && textResponse.trim()) {
        try {
          responseData = JSON.parse(textResponse)
          console.log('Resposta N8N (JSON parseado):', responseData)
        } catch (parseError) {
          console.log('Texto não é JSON válido, usando como string:', textResponse)
          // Se não for JSON, trata como string simples
          responseData = { explicacao: textResponse, resposta: textResponse }
        }
      }
    } catch (responseError) {
      console.log('Erro ao ler resposta:', responseError)
      // Se não conseguir ler, deixa como null
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