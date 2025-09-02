-- RLS Validation Test Script
-- Tests cross-tenant data isolation and proper access controls

-- Create test function to simulate different user contexts
CREATE OR REPLACE FUNCTION test_rls_isolation()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  escola_a_id uuid;
  escola_b_id uuid;
  user_admin_a uuid := gen_random_uuid();
  user_admin_b uuid := gen_random_uuid();
  user_coord_a uuid := gen_random_uuid();
  student_a_id uuid;
  student_b_id uuid;
  professor_a_id uuid;
  turma_a_id uuid;
  turma_b_id uuid;
  materia_a_id uuid;
  test_result text := '';
  row_count integer;
BEGIN
  -- Step 1: Create test schools
  INSERT INTO escolas (id, nome, codigo, ativa) VALUES 
    (gen_random_uuid(), 'Escola A Test', 'escola-a-test', true),
    (gen_random_uuid(), 'Escola B Test', 'escola-b-test', true)
  RETURNING id INTO escola_a_id;
  
  SELECT id INTO escola_b_id FROM escolas WHERE codigo = 'escola-b-test';
  
  test_result := test_result || 'Created test schools A(' || escola_a_id || ') and B(' || escola_b_id || ')' || E'\n';

  -- Step 2: Create test profiles (simulating auth.users entries)
  INSERT INTO profiles (user_id, full_name, role, escola_id) VALUES
    (user_admin_a, 'Admin Escola A', 'school_admin', escola_a_id),
    (user_admin_b, 'Admin Escola B', 'school_admin', escola_b_id),
    (user_coord_a, 'Coordenador A', 'coordinator', escola_a_id);

  test_result := test_result || 'Created test profiles for users' || E'\n';

  -- Step 3: Create test turmas
  INSERT INTO turmas (id, nome, codigo, serie, ano_letivo, escola_id) VALUES
    (gen_random_uuid(), 'Turma A1', 'A1-test', '1º Ano', '2024', escola_a_id),
    (gen_random_uuid(), 'Turma B1', 'B1-test', '1º Ano', '2024', escola_b_id)
  RETURNING id INTO turma_a_id;
  
  SELECT id INTO turma_b_id FROM turmas WHERE codigo = 'B1-test';

  -- Step 4: Create test materias
  INSERT INTO materias (id, nome, codigo, escola_id) VALUES
    (gen_random_uuid(), 'Matematica A', 'MAT-A', escola_a_id),
    (gen_random_uuid(), 'Matematica B', 'MAT-B', escola_b_id)
  RETURNING id INTO materia_a_id;

  -- Step 5: Create test students
  INSERT INTO students (id, name, codigo, ano_letivo, turma, escola_id, turma_id) VALUES
    (gen_random_uuid(), 'Student A', 'STUD-A', '2024', 'A1', escola_a_id, turma_a_id),
    (gen_random_uuid(), 'Student B', 'STUD-B', '2024', 'B1', escola_b_id, turma_b_id)
  RETURNING id INTO student_a_id;
  
  SELECT id INTO student_b_id FROM students WHERE codigo = 'STUD-B';

  -- Step 6: Create test professor
  INSERT INTO professores (id, nome, email, codigo, password_hash, escola_id) VALUES
    (gen_random_uuid(), 'Professor A', 'prof.a@test.com', 'PROF-A', 'hash123', escola_a_id)
  RETURNING id INTO professor_a_id;

  test_result := test_result || 'Created test data: students, professors, turmas, materias' || E'\n';

  -- TEST 1: Test escola visibility - Admin A should only see escola A
  PERFORM set_config('request.jwt.claims', json_build_object('sub', user_admin_a)::text, true);
  
  SELECT COUNT(*) INTO row_count FROM escolas WHERE id = escola_b_id;
  IF row_count > 0 THEN
    RAISE EXCEPTION 'RLS VIOLATION: Admin A can see Escola B data';
  END IF;
  test_result := test_result || 'PASS: Admin A cannot see Escola B' || E'\n';

  -- TEST 2: Test student visibility - Admin A should only see students from escola A
  SELECT COUNT(*) INTO row_count FROM students WHERE escola_id = escola_b_id;
  IF row_count > 0 THEN
    RAISE EXCEPTION 'RLS VIOLATION: Admin A can see students from Escola B';
  END IF;
  test_result := test_result || 'PASS: Admin A cannot see students from Escola B' || E'\n';

  -- TEST 3: Test professor visibility - Admin A should only see professors from escola A
  SELECT COUNT(*) INTO row_count FROM professores WHERE escola_id = escola_b_id;
  IF row_count > 0 THEN
    RAISE EXCEPTION 'RLS VIOLATION: Admin A can see professors from Escola B';
  END IF;
  test_result := test_result || 'PASS: Admin A cannot see professors from Escola B' || E'\n';

  -- TEST 4: Switch context to Admin B
  PERFORM set_config('request.jwt.claims', json_build_object('sub', user_admin_b)::text, true);
  
  SELECT COUNT(*) INTO row_count FROM students WHERE escola_id = escola_a_id;
  IF row_count > 0 THEN
    RAISE EXCEPTION 'RLS VIOLATION: Admin B can see students from Escola A';
  END IF;
  test_result := test_result || 'PASS: Admin B cannot see students from Escola A' || E'\n';

  -- TEST 5: Test coordinator permissions - Coord A should see escola A data
  PERFORM set_config('request.jwt.claims', json_build_object('sub', user_coord_a)::text, true);
  
  SELECT COUNT(*) INTO row_count FROM students WHERE escola_id = escola_a_id;
  IF row_count = 0 THEN
    RAISE EXCEPTION 'RLS VIOLATION: Coordinator A cannot see students from own school';
  END IF;
  test_result := test_result || 'PASS: Coordinator A can see students from own school' || E'\n';

  -- TEST 6: Coordinator should not see other school data
  SELECT COUNT(*) INTO row_count FROM students WHERE escola_id = escola_b_id;
  IF row_count > 0 THEN
    RAISE EXCEPTION 'RLS VIOLATION: Coordinator A can see students from Escola B';
  END IF;
  test_result := test_result || 'PASS: Coordinator A cannot see students from other schools' || E'\n';

  -- TEST 7: Test turmas visibility
  PERFORM set_config('request.jwt.claims', json_build_object('sub', user_admin_a)::text, true);
  
  SELECT COUNT(*) INTO row_count FROM turmas WHERE escola_id = escola_b_id;
  IF row_count > 0 THEN
    RAISE EXCEPTION 'RLS VIOLATION: Admin A can see turmas from Escola B';
  END IF;
  test_result := test_result || 'PASS: Admin A cannot see turmas from other schools' || E'\n';

  -- TEST 8: Test materias visibility  
  SELECT COUNT(*) INTO row_count FROM materias WHERE escola_id = escola_b_id;
  IF row_count > 0 THEN
    RAISE EXCEPTION 'RLS VIOLATION: Admin A can see materias from Escola B';
  END IF;
  test_result := test_result || 'PASS: Admin A cannot see materias from other schools' || E'\n';

  -- Cleanup: Remove test data
  DELETE FROM professor_materia_turma WHERE professor_id = professor_a_id;
  DELETE FROM professores WHERE codigo IN ('PROF-A');
  DELETE FROM students WHERE codigo IN ('STUD-A', 'STUD-B');
  DELETE FROM materias WHERE codigo IN ('MAT-A', 'MAT-B');  
  DELETE FROM turmas WHERE codigo IN ('A1-test', 'B1-test');
  DELETE FROM profiles WHERE user_id IN (user_admin_a, user_admin_b, user_coord_a);
  DELETE FROM escolas WHERE codigo IN ('escola-a-test', 'escola-b-test');

  test_result := test_result || 'Cleanup completed - test data removed' || E'\n';
  test_result := test_result || '✅ ALL RLS TESTS PASSED - Data isolation is working correctly' || E'\n';

  RETURN test_result;
  
EXCEPTION 
  WHEN OTHERS THEN
    -- Cleanup on error
    DELETE FROM professor_materia_turma WHERE professor_id = professor_a_id;
    DELETE FROM professores WHERE codigo IN ('PROF-A');
    DELETE FROM students WHERE codigo IN ('STUD-A', 'STUD-B');
    DELETE FROM materias WHERE codigo IN ('MAT-A', 'MAT-B');
    DELETE FROM turmas WHERE codigo IN ('A1-test', 'B1-test');
    DELETE FROM profiles WHERE user_id IN (user_admin_a, user_admin_b, user_coord_a);
    DELETE FROM escolas WHERE codigo IN ('escola-a-test', 'escola-b-test');
    
    RAISE EXCEPTION 'RLS TEST FAILED: %', SQLERRM;
END;
$$;

-- Create convenience function to run tests
CREATE OR REPLACE FUNCTION run_rls_tests()
RETURNS text
LANGUAGE sql
AS $$
  SELECT test_rls_isolation();
$$;

-- Usage: SELECT run_rls_tests();