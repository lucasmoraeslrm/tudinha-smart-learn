import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, X-Student-Session",
};

type SaveEssayRequest = {
  tema_id: string;
  titulo?: string | null;
  conteudo: string;
  palavras?: number;
  tempo_ms?: number;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Read student session from header
    const studentHeader = req.headers.get("X-Student-Session");
    if (!studentHeader) {
      return new Response(
        JSON.stringify({ error: "Sessão do estudante não encontrada" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let studentSession: any;
    try {
      studentSession = JSON.parse(studentHeader);
    } catch (_e) {
      return new Response(
        JSON.stringify({ error: "Sessão do estudante inválida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: SaveEssayRequest = await req.json();
    if (!body?.tema_id || !body?.conteudo?.trim()) {
      return new Response(
        JSON.stringify({ error: "tema_id e conteudo são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Validate student exists and get escola_id from DB for safety
    const { data: student, error: studentError } = await serviceClient
      .from("students")
      .select("id, escola_id")
      .eq("id", studentSession.id)
      .single();

    if (studentError || !student) {
      return new Response(
        JSON.stringify({ error: "Estudante não encontrado ou inválido" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const palavras = body.palavras ?? body.conteudo.trim().split(/\s+/).filter(Boolean).length;
    const tempo_ms = body.tempo_ms ?? 0;

    const insertPayload = {
      user_id: student.id, // associar ao próprio estudante
      student_id: student.id,
      escola_id: student.escola_id,
      tema_id: body.tema_id,
      titulo: body.titulo?.trim() || null,
      conteudo: body.conteudo.trim(),
      palavras,
      tempo_ms,
      status: "enviada",
    } as const;

    const { data: inserted, error: insertError } = await serviceClient
      .from("redacoes_usuario")
      .insert(insertPayload)
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, essay: inserted }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("salvar-redacao error:", e);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});