
-- Função segura para obter a série do aluno atual já normalizada
-- Normalização aplicada:
-- - lowercase
-- - troca "série"/"serie" por "ano"
-- - colapsa espaços múltiplos
-- Observação: RLS é respeitado pelo Postgres, mas como a função é SECURITY DEFINER
-- e de posse do owner, consegue ler as tabelas necessárias de forma controlada.

create or replace function public.get_current_student_serie_normalized()
returns text
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_student_id uuid;
  v_serie text;
  v_norm text;
begin
  -- pega o student_id do usuário autenticado atual
  select p.student_id
    into v_student_id
  from public.profiles p
  where p.user_id = auth.uid()
  limit 1;

  if v_student_id is null then
    return null;
  end if;

  -- lê a série da turma do aluno
  select t.serie
    into v_serie
  from public.students s
  join public.turmas t on t.id = s.turma_id
  where s.id = v_student_id
  limit 1;

  if v_serie is null then
    -- sem turma associada -> sem série
    return null;
  end if;

  -- normalização
  v_norm := lower(v_serie);
  -- troca "série"/"serie" por "ano"
  v_norm := regexp_replace(v_norm, '\bs[ée]rie\b', 'ano', 'gi');
  -- remove espaços duplicados
  v_norm := regexp_replace(v_norm, '\s+', ' ', 'g');
  v_norm := btrim(v_norm);

  return v_norm;
end;
$$;

-- Permissões de execução
grant execute on function public.get_current_student_serie_normalized() to anon, authenticated;
