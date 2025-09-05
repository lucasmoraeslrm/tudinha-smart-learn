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
    // Normaliza para um objeto estruturado (nota_final, comentario_geral, competencias)
    const normalizeResponse = (resp: any) => {
      const out: any = {
        nota_final: (resp && resp.nota_final) || 0,
        comentario_geral: (resp && (resp.comentario_geral || resp.feedback_geral)) || '',
        feedback_geral: (resp && (resp.feedback_geral || resp.comentario_geral)) || '',
        competencias: (resp && resp.competencias) || {}
      }

      let markdown = ''
      if (typeof resp === 'string') markdown = resp
      if (!markdown && resp && typeof resp === 'object') {
        if (typeof resp.resposta === 'string') markdown = resp.resposta
        else if (typeof resp.explicacao === 'string') markdown = resp.explicacao
        else if (typeof resp.text === 'string') markdown = resp.text
      }

      if (markdown) {
        // Nota Final
        const notaMatch = markdown.match(/Nota\s*Final\s*[:–-]?\s*(\d{1,4})/i)
        if (notaMatch) out.nota_final = parseInt(notaMatch[1], 10)

        // Comentários Finais
        const comentariosMatch = markdown.match(/##\s*Coment[aá]rios?\s*Finais[\s\S]*$/i)
        if (comentariosMatch) {
          out.comentario_geral = comentariosMatch[0]
            .replace(/##\s*Coment[aá]rios?\s*Finais/i, '')
            .trim()
          out.feedback_geral = out.comentario_geral
        }

        // Competências 1..5
        const titleMap: Record<number, string> = {
          1: 'Domínio da norma culta',
          2: 'Compreensão da proposta',
          3: 'Argumentação e dados',
          4: 'Coesão e coerência',
          5: 'Proposta de intervenção',
        }
        for (let i = 1; i <= 5; i++) {
          const blockMatch = markdown.match(new RegExp(`Crit[ée]rio\\s*${i}[\\s\\S]*?(?:\n\n|$)`, 'i'))
          const pontuacaoMatch = markdown.match(new RegExp(`Crit[ée]rio\\s*${i}[\\s\\S]*?Pontua[cç][aã]o\\s*[:–-]?\\s*(\\d{1,3}|200)`, 'i'))
          const pontosMelhorarMatch = markdown.match(new RegExp(`Crit[ée]rio\\s*${i}[\\s\\S]*?Pontos a Melhorar:\\s*([\\s\\S]*?)(?:\\n\\s*---|$)`, 'i'))
          if (pontuacaoMatch) {
            out.competencias[`competencia_${i}`] = {
              titulo: titleMap[i],
              nota: parseInt(pontuacaoMatch[1], 10),
              feedback: pontosMelhorarMatch ? pontosMelhorarMatch[1].trim() : (blockMatch ? blockMatch[0].trim() : undefined),
            }
          }
        }
      }

      if (!out.comentario_geral) out.comentario_geral = 'Feedback não disponível'
      if (!out.feedback_geral) out.feedback_geral = out.comentario_geral
      if (!out.competencias) out.competencias = {}

      return out
    }

    const normalized = normalizeResponse(responseData)

    return new Response(
      JSON.stringify(normalized),
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