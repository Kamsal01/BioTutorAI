# BioTutor ITS

BioTutor ITS is a production-ready foundation for a Biology Intelligent Tutoring System for secondary school students and Biology teachers. It uses Next.js, React, TypeScript, Tailwind CSS, Supabase, Gemini, adaptive quiz logic, gamification, teacher analytics, and PWA lesson caching.

## Features

- Student and teacher authentication with Supabase Auth
- Role-based dashboard routing
- Structured Biology lessons with objectives, pre-test flow, lesson content, key terms, diagram placeholders, activities, adaptive quiz, remediation, post-test, and summary
- Gemini-powered Biology tutor at `/tutor`, scoped to conservation, pest and disease control, and reproduction in birds and mammals
- Multiple-choice adaptive assessment logic with score, mastery, XP, and remediation rules
- Student dashboard with topics, progress, XP, streaks, badges, recommendations, and learning history
- Teacher dashboard with lesson management, quiz management, weak-student monitoring, chatbot monitoring hooks, and analytics pages
- Supabase schema for profiles, topics, lessons, quizzes, questions, quiz attempts, chatbot logs, progress, badges, leaderboard, and analytics events
- PWA manifest and service-worker setup through `next-pwa` for cached lesson/static access
- Vercel-ready environment variable setup

## Install

```bash
npm install
cp .env.example .env.local
```

## Supabase Setup

1. Create a Supabase project.
2. Copy the project URL and anon key into `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. In Supabase SQL Editor, run `supabase/schema.sql`.
4. Then run `supabase/seed.sql` to add only the approved lessons from `Ifeoma_lesson updated.docx`.
5. In Supabase Authentication settings, enable email/password sign-in.
6. Keep Row Level Security enabled. The schema includes RLS policies and helper functions for teacher access.

## Gemini Setup

Create a Gemini API key in Google AI Studio and add it to `.env.local`:

```bash
GEMINI_API_KEY=your-gemini-api-key
```

The key is only used in server API routes. Do not expose it with a `NEXT_PUBLIC_` prefix.

## Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Register as a student or teacher. Students route to `/student`; teachers route to `/teacher`.

## Deployment on Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add these environment variables in Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` if you add admin-only server jobs
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy. Run the Supabase SQL files in your production Supabase project before inviting users.

## Teacher Workflow

Teachers sign in with the teacher role, open `/teacher`, then use:

- `/teacher/lessons` to add or edit topics, objectives, content, key terms, diagram prompts, activities, remediation, and summaries.
- `/teacher/quizzes` to manually add MCQs or call `/api/generate-quiz` for Gemini-assisted draft questions.
- `/analytics` to review scores, weak topics, engagement, progress, and chatbot interaction trends.

In a live classroom, wire the lesson and quiz forms to the Supabase `topics`, `lessons`, `quizzes`, and `questions` tables already defined in `supabase/schema.sql`.

## Student Workflow

Students open `/student`, choose a Biology topic, read the structured lesson, ask BioTutor for help, and complete the adaptive quiz. Scores below 50% trigger remediation. Scores of 50% or higher unlock progression, XP, and mastery updates. Previously opened lessons can be read offline after the PWA service worker has cached them.

## Security Notes

- Supabase Auth handles credentials and sessions.
- Middleware protects student, teacher, lesson, quiz, tutor, analytics, profile, progress, and leaderboard routes.
- Teacher routes require `user_metadata.role = "teacher"`.
- Gemini calls run server-side only.
- Zod validates API payloads.
- RLS policies restrict student records to the owner and analytics/progress records to teachers.

## Project Structure

```text
app/                  Next.js app router pages and API routes
components/           Reusable UI, lesson, quiz, auth, and tutor components
lib/                  Types, Supabase clients, adaptive engine, approved course scope
public/               PWA manifest and app icons
supabase/             Database schema, RLS policies, and seed data
```

## Next Development Steps

- Expand lesson explanations within the approved course scope while keeping `Ifeoma_lesson updated.docx` as the foundation.
- Connect teacher forms to Supabase insert/update/delete actions.
- Store tutor conversations in `chatbot_logs`.
- Store quiz submissions through `/api/progress`.
- Add CSV export from teacher analytics.
- Add Playwright tests for auth routing, quiz scoring, and lesson offline access.
"# BioTutorAI" 
"# BioTutorAI" 
