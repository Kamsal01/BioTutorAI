-- Run after supabase/schema.sql if your project was created before teacher quiz publishing.
-- The main schema already includes quizzes and questions tables, so this file is mainly a checklist-safe no-op.

alter table public.quizzes enable row level security;
alter table public.questions enable row level security;

-- Existing schema policies allow teachers to manage quizzes and questions.
-- Re-run the main schema if these policies are missing in your Supabase project.
