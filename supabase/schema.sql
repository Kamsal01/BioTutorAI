create type public.user_role as enum ('student', 'teacher');
create type public.difficulty_level as enum ('easy', 'medium', 'hard');
create type public.mastery_status as enum ('needs-remediation', 'developing', 'mastered');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role public.user_role not null default 'student',
  xp integer not null default 0,
  level integer not null default 1,
  daily_streak integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null default '',
  level integer not null default 1,
  estimated_minutes integer not null default 30,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  title text not null,
  source_note_title text not null default 'Ifeoma_lesson updated.docx',
  approval_status text not null default 'draft' check (approval_status in ('draft', 'pending_review', 'approved', 'rejected')),
  objectives jsonb not null default '[]',
  introduction text not null default '',
  content jsonb not null default '[]',
  key_terms jsonb not null default '[]',
  diagram_url text,
  diagram_prompt text,
  activity text,
  remediation text,
  summary text,
  published boolean not null default false,
  created_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  quiz_type text not null check (quiz_type in ('pre-test', 'adaptive', 'post-test')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_text text not null,
  options jsonb not null,
  correct_answer text not null,
  explanation text not null,
  difficulty public.difficulty_level not null,
  topic_tag text not null,
  created_at timestamptz not null default now()
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  answers jsonb not null default '{}',
  passed boolean generated always as (score >= 50) stored,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completion integer not null default 0 check (completion between 0 and 100),
  best_score integer not null default 0 check (best_score between 0 and 100),
  time_spent_minutes integer not null default 0,
  mastery public.mastery_status not null default 'developing',
  synced_at timestamptz not null default now(),
  unique (student_id, lesson_id)
);

create table public.chatbot_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete set null,
  topic_id uuid references public.topics(id) on delete set null,
  user_message text not null,
  bot_reply text not null,
  refused boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text not null,
  xp_reward integer not null default 0
);

create table public.student_badges (
  student_id uuid references public.profiles(id) on delete cascade,
  badge_id uuid references public.badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (student_id, badge_id)
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade,
  event_name text not null,
  topic_id uuid references public.topics(id) on delete set null,
  lesson_id uuid references public.lessons(id) on delete set null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create view public.leaderboard as
select id, full_name, xp, level, daily_streak
from public.profiles
where role = 'student'
order by xp desc, daily_streak desc;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'student'));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create function public.is_teacher()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher');
$$;

create function public.increment_xp(amount integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set xp = xp + amount,
      level = greatest(1, floor((xp + amount) / 500) + 1)
  where id = auth.uid();
end;
$$;

alter table public.profiles enable row level security;
alter table public.topics enable row level security;
alter table public.lessons enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.progress enable row level security;
alter table public.chatbot_logs enable row level security;
alter table public.badges enable row level security;
alter table public.student_badges enable row level security;
alter table public.analytics_events enable row level security;

create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Teachers read profiles" on public.profiles for select using (public.is_teacher());

create policy "Published topics are readable" on public.topics for select using (true);
create policy "Teachers manage topics" on public.topics for all using (public.is_teacher()) with check (public.is_teacher());

create policy "Published lessons are readable" on public.lessons for select using (published or public.is_teacher());
create policy "Teachers manage lessons" on public.lessons for all using (public.is_teacher()) with check (public.is_teacher());

create policy "Quizzes readable" on public.quizzes for select using (true);
create policy "Questions readable" on public.questions for select using (true);
create policy "Teachers manage quizzes" on public.quizzes for all using (public.is_teacher()) with check (public.is_teacher());
create policy "Teachers manage questions" on public.questions for all using (public.is_teacher()) with check (public.is_teacher());

create policy "Students manage own attempts" on public.quiz_attempts for all using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "Teachers read attempts" on public.quiz_attempts for select using (public.is_teacher());
create policy "Students manage own progress" on public.progress for all using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "Teachers read progress" on public.progress for select using (public.is_teacher());
create policy "Students manage own chat logs" on public.chatbot_logs for all using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "Teachers read chat logs" on public.chatbot_logs for select using (public.is_teacher());
create policy "Badges readable" on public.badges for select using (true);
create policy "Students read own badges" on public.student_badges for select using (student_id = auth.uid());
create policy "Analytics own insert read" on public.analytics_events for all using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "Teachers read analytics" on public.analytics_events for select using (public.is_teacher());

insert into public.badges (code, name, description, xp_reward) values
('conservation-keeper', 'Conservation Keeper', 'Completed the conservation lesson-note section.', 50),
('quiz-sprint', 'Quiz Sprint', 'Passed three quizzes in one day.', 75),
('streak-star', 'Streak Star', 'Maintained a seven-day learning streak.', 100)
on conflict do nothing;
