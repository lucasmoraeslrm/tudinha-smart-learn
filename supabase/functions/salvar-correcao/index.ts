import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-student-session",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("Missing Supabase env vars");
    return new Response(
      JSON.stringify({ error: "Server not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    const studentHeader = req.headers.get("X-Student-Session") || req.headers.get("x-student-session");
    if (!studentHeader) {
      return new Response(
        JSON.stringify({ error: "Missing X-Student-Session header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let studentSession: any = {};
    try {
      studentSession = JSON.parse(studentHeader);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid student session header" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Student id might be at root or nested
    const headerStudentId = studentSession?.id || studentSession?.student?.id;
    if (!headerStudentId) {
      return new Response(
        JSON.stringify({ error: "Student id not found in session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { redacao_id, correcao, status } = await req.json();
    if (!redacao_id || !correcao) {
      return new Response(
        JSON.stringify({ error: "redacao_id and correcao are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("Salvar correção - received:", { redacao_id, status, student: headerStudentId });

    // Ensure essay belongs to student
    const { data: redacao, error: fetchErr } = await supabaseAdmin
      .from("redacoes_usuario")
      .select("id, student_id")
      .eq("id", redacao_id)
      .maybeSingle();

    if (fetchErr) {
      console.error("Fetch essay error:", fetchErr);
      return new Response(
        JSON.stringify({ error: "Erro ao buscar redação" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!redacao) {
      return new Response(
        JSON.stringify({ error: "Redação não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (redacao.student_id !== headerStudentId) {
      return new Response(
        JSON.stringify({ error: "Não autorizado a alterar esta redação" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let statusToSet = status || "corrigida";

    // Attempt update; if status violates a CHECK constraint, retry with a safe fallback
    let updateResult = await supabaseAdmin
      .from("redacoes_usuario")
      .update({
        status: statusToSet,
        correcao_ia: correcao,
        data_correcao: new Date().toISOString(),
      })
      .eq("id", redacao_id)
      .select("*")
      .maybeSingle();

    if (updateResult.error && updateResult.error.code === "23514") {
      console.warn("Status CHECK failed for value:", statusToSet, "→ retrying with 'corrigido'");
      statusToSet = "corrigido";
      updateResult = await supabaseAdmin
        .from("redacoes_usuario")
        .update({
          status: statusToSet,
          correcao_ia: correcao,
          data_correcao: new Date().toISOString(),
        })
        .eq("id", redacao_id)
        .select("*")
        .maybeSingle();
    }

    if (updateResult.error) {
      console.error("Update error:", updateResult.error);
      return new Response(
        JSON.stringify({ error: "Erro ao salvar correção", details: updateResult.error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, redacao: updateResult.data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("Salvar correção - unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno", details: err?.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
