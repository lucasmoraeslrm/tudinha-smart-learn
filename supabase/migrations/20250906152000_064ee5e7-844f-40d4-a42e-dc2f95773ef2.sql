-- Drop old views that depend on exercises table
DROP VIEW IF EXISTS v_exercises_catalog;
DROP VIEW IF EXISTS exercises_v;

-- Drop student_answers table (references exercises)
DROP TABLE IF EXISTS student_answers;

-- Drop exercise_lists table 
DROP TABLE IF EXISTS exercise_lists;

-- Drop exercises table
DROP TABLE IF EXISTS exercises;