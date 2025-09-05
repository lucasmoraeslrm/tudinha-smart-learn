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
    const { webhookUrl, webhookData } = await req.json()
    
    if (!webhookUrl) {
      throw new Error('webhookUrl is required')
    }
    
    console.log('Enviando dados para:', webhookUrl)
    console.log('Dados:', webhookData)

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    })

    console.log('Status da resposta:', response.status)

    let responseData = null
    try {
      const textResponse = await response.text()
      console.log('Resposta (texto completo):', textResponse)
      
      if (textResponse && textResponse.trim()) {
        try {
          responseData = JSON.parse(textResponse)
          console.log('Resposta (JSON parseado):', responseData)
        } catch (parseError) {
          console.log('Texto não é JSON válido, usando como string:', textResponse)
          // Se não for JSON, trata como string simples
          responseData = { 
            comentario_geral: textResponse, 
            feedback_geral: textResponse,
            nota_final: 0,
            competencias: {}
          }
        }
      } else {
        // Resposta vazia - criar estrutura mínima de feedback
        responseData = {
          comentario_geral: "Correção processada com sucesso, mas sem feedback detalhado disponível.",
          feedback_geral: "Sua redação foi processada. Entre em contato com o suporte para mais detalhes.",
          nota_final: 0,
          competencias: {}
        }
      }
    } catch (responseError) {
      console.log('Erro ao ler resposta:', responseError)
      // Se não conseguir ler, cria feedback de erro
      responseData = {
        comentario_geral: "Erro ao processar a correção. Tente novamente.",
        feedback_geral: "Houve um problema técnico durante a correção.",
        nota_final: 0,
        competencias: {}
      }
    }

    // Garantir estrutura mínima para o feedback
    if (responseData && typeof responseData === 'object') {
      responseData = {
        nota_final: responseData.nota_final || 0,
        comentario_geral: responseData.comentario_geral || responseData.feedback_geral || 'Feedback não disponível',
        feedback_geral: responseData.feedback_geral || responseData.comentario_geral || 'Feedback não disponível',
        competencias: responseData.competencias || {},
        ...responseData
      }
    }

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na função webhook:', error)
    
    // Criar resposta de erro estruturada para o frontend
    const errorResponse = {
      comentario_geral: "Erro técnico durante a correção. Nossa equipe foi notificada.",
      feedback_geral: "Houve um problema ao processar sua redação. Tente novamente em alguns minutos.",
      nota_final: 0,
      competencias: {},
      error_details: error.message
    }
    
    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})