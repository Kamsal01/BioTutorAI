# BioTutor ITS

BioTutor ITS is a production-ready Biology Intelligent Tutoring System for secondary school students and Biology teachers. It uses Next.js, React, TypeScript, Tailwind CSS, Firebase Auth, Firestore, Firebase Storage, Gemini, adaptive quiz logic, gamification, teacher analytics, and PWA lesson caching.

For teacher, student, admin, Firebase, Vercel, and troubleshooting instructions, see [USER_MANUAL.md](./USER_MANUAL.md).

## Features

- Student and teacher authentication with Firebase Auth
- Role-based dashboard routing through Firestore profile roles
- Structured Biology lessons with objectives, content, key terms, diagrams, activities, quizzes, remediation, and summary
- Conversational Gemini-powered Biology tutor at `/tutor`
- Built-in 20-question MCQ starter quiz for every lesson
- Teacher quiz manager for publishing exactly 20 MCQs per module
- Student dashboard with topics, progress, XP, streaks, badges, recommendations, and learning history
- Editable student and teacher profiles with Firebase Storage picture upload
- Teacher lesson editor with image uploads and H5P-style activity blocks
- Firestore-backed approved lessons and published quizzes
- PWA manifest and service-worker setup through `next-pwa`
- Vercel-ready environment variable setup

## Install

```bash
pnpm install
cp .env.example .env.local
```

## Firebase Setup

1. Create a Firebase project at Firebase Console.
2. Create a Web App in the Firebase project.
3. Enable **Authentication > Sign-in method > Email/Password**.
4. Create a **Firestore Database**.
5. Enable **Firebase Storage**.
6. Copy your Firebase web app config into `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

7. In Firebase Firestore Rules, use `firebase-firestore.rules` as a starting point.
8. In Firebase Storage Rules, use `firebase-storage.rules` as a starting point.

## Gemini Setup

Create a Gemini API key in Google AI Studio and add it to `.env.local`:

```bash
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash
```

The key is only used in server API routes. Do not expose it with a `NEXT_PUBLIC_` prefix.

## Run Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Register as a student or teacher. Students route to `/student`; teachers route to `/teacher`.

## Deployment On Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add these environment variables in Vercel Project Settings:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL`
   - `NEXT_PUBLIC_APP_URL`
4. Redeploy.
5. Test register, login, lesson approval, quiz publishing, AI tutor, and profile picture upload.

## Teacher Workflow

Teachers sign in with the teacher role, open `/teacher`, then use:

- `/teacher/lessons` to edit lesson titles, objectives, content, key terms, diagram prompts, uploaded lesson pictures, H5P-style activities, remediation, and summaries.
- `/teacher/quizzes` to create, upload, edit, and publish exactly 20 MCQs per module.
- `/analytics` to review scores, weak topics, engagement, progress, and chatbot interaction trends.

Teacher-approved lessons are stored in Firestore under `lessons/{topicSlug}`. Published quizzes are stored in Firestore under `quizzes/{topicSlug}`.

## Student Workflow

Students open `/student`, choose a Biology topic, read the lesson, ask BioTutor for help, and complete the adaptive quiz. Scores below 50% trigger remediation. Scores of 50% or higher unlock progression, XP, and mastery updates. Previously opened lessons can be read offline after the PWA service worker has cached them.

Students can open `/profile` to edit their name, class level, school name, short bio, and profile picture.

## Security Notes

- Firebase Auth handles credentials and sessions.
- Firestore profile documents store user roles.
- Firestore and Storage rules should be deployed before classroom use.
- Gemini calls run server-side only.
- Zod validates server API payloads.
- Do not expose Gemini keys or other server-only secrets with `NEXT_PUBLIC_`.

## Project Structure

```text
app/                  Next.js app router pages and API routes
components/           Reusable UI, lesson, quiz, auth, and tutor components
lib/                  Types, Firebase client, adaptive engine, content, stores
public/               PWA manifest, app icons, lesson images
firebase-*.rules      Starter Firebase Firestore and Storage security rules
supabase/             Legacy Supabase SQL files kept for reference only
```

## Notes

The active backend flow now uses Firebase. Supabase files remain in the repository only as legacy reference material from the earlier backend version.
