# BioTutor ITS User Manual

## 1. What BioTutor ITS Is

BioTutor ITS is a Biology Intelligent Tutoring System for secondary school students and Biology teachers. It helps students read Biology lessons, ask an AI tutor questions, take quizzes, earn progress/XP, and review learning history. Teachers can manage lessons, upload lesson pictures, create H5P-style activities, publish quizzes, and monitor learning.

The system has two main user roles:

- Student: learns Biology, uses the AI tutor, takes quizzes, and tracks progress.
- Teacher: manages lesson content, uploads images, creates quizzes, and views analytics.

## 2. First-Time Setup For The School/Admin

Before students and teachers use the app online, the admin should confirm these are ready:

1. Supabase project is connected.
2. Supabase SQL schema has been run.
3. Environment variables are added in Vercel.
4. Vercel has redeployed successfully.
5. Teacher accounts have role `teacher`.
6. Student accounts have role `student`.

Required Vercel environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
NEXT_PUBLIC_APP_URL
```

Important: `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` must not start with `NEXT_PUBLIC_`.

## 3. How To Register

1. Open the BioTutor ITS website.
2. Click **Create an account**.
3. Enter full name, email, and password.
4. Choose the correct role: **Student** or **Teacher**.
5. Submit the form.
6. If email confirmation is enabled in Supabase, open the email inbox and confirm the account.
7. Return to the app and log in.

If login says invalid credentials, check:

- The email is typed correctly.
- The password is correct.
- The account has been confirmed if Supabase email confirmation is enabled.
- The user still exists in Supabase Authentication.

## 4. How To Log In

1. Open `/login`.
2. Enter email and password.
3. Select the correct role tab: **Student** or **Teacher**.
4. Click **Sign in**.

After login:

- Students go to the student dashboard.
- Teachers go to the teacher dashboard.

## 5. Student Manual

### 5.1 Student Dashboard

The student dashboard shows:

- Biology lesson topics
- XP points
- Level
- Daily streak
- Badges
- Recommended next lesson
- Learning history
- Progress for each topic

Students should start from Lesson One and continue lesson by lesson.

### 5.2 Opening A Lesson

1. Log in as a student.
2. Open the student dashboard.
3. Click a lesson topic.
4. Read the learning objectives.
5. Study the main lesson content.
6. Review diagrams or lesson pictures.
7. Complete any H5P-style activities.
8. Use remediation if needed.
9. Click **Take quiz**.

### 5.3 Taking A Quiz

Each lesson has 20 multiple-choice questions.

1. Open a lesson.
2. Click **Take quiz**.
3. Choose one answer for each question.
4. Click **Submit quiz**.
5. Review your score and feedback.
6. If score is below 50%, review the lesson and retry.
7. If score is 50% or above, progress is saved.

The app awards XP based on performance.

### 5.4 Using The AI Tutor

1. Open **AI Tutor** or `/tutor`.
2. Ask a Biology question naturally.
3. You can ask follow-up questions like:

```text
Explain reproduction
Break it down
Give examples
Explain like a child
Quiz me
What is the difference between birds and mammals?
```

BioTutor should answer Biology questions conversationally. It should refuse non-Biology questions politely.

### 5.5 Editing Student Profile

1. Open **Profile**.
2. Edit name, school, class level, and bio.
3. Upload a profile picture if desired.
4. Save changes.

## 6. Teacher Manual

### 6.1 Teacher Dashboard

The teacher dashboard gives access to:

- Lesson management
- Quiz management
- Analytics
- Student monitoring
- Profile page

### 6.2 Editing Lessons

1. Log in as a teacher.
2. Open `/teacher/lessons`.
3. Select a lesson from the left list.
4. Edit lesson title, introduction, objectives, main content, key terms, activity, remediation, and summary.
5. Upload a lesson picture if needed.
6. Add H5P-style activities if needed.
7. Click **Save draft** to save locally.
8. Click **Approve for students** to publish online.

Important: students in other browsers see changes only after the teacher clicks **Approve for students** and publishing succeeds.

### 6.3 Uploading Lesson Pictures

1. Open `/teacher/lessons`.
2. Select the lesson.
3. Go to **Lesson picture or diagram**.
4. Click **Upload lesson picture**.
5. Choose an image below the size limit.
6. Click **Save draft**.
7. Click **Approve for students**.

If the image is too large, compress it first and upload again.

### 6.4 Adding H5P-Style Activities

Teachers can add:

- Multiple choice
- Flashcards
- Fill in the blank
- Drag and sort

Steps:

1. Open `/teacher/lessons`.
2. Select the lesson.
3. Go to **H5P-style interactive features**.
4. Click the activity type.
5. Fill in title, prompt, answer, and options/items.
6. Save draft.
7. Approve for students.

### 6.5 Creating Or Uploading Quizzes

1. Open `/teacher/quizzes`.
2. Select the lesson/module.
3. Add or edit questions.
4. Make sure there are exactly 20 complete multiple-choice questions.
5. Each question must have:

- Question text
- Four options
- Correct answer
- Explanation
- Difficulty level

6. Click **Publish 20 questions**.

Students will see the teacher-published quiz after refresh. If no teacher quiz is published, students see the built-in 20-question starter quiz.

### 6.6 Viewing Analytics

Open `/analytics` to review:

- Quiz scores
- Weak topics
- Strong topics
- Lesson completion
- Engagement
- Progress trends

Use analytics to identify students who need support.

## 7. Supabase Admin Manual

### 7.1 View Registered Users

To see all login accounts:

1. Open Supabase.
2. Go to **Authentication**.
3. Click **Users**.

To see student/teacher roles:

1. Go to **Table Editor**.
2. Open `profiles`.
3. Check the `role` column.

SQL to list users:

```sql
select
  id,
  full_name,
  role,
  school_name,
  class_level,
  xp,
  level,
  daily_streak,
  created_at
from public.profiles
order by created_at desc;
```

### 7.2 View Only Students

```sql
select *
from public.profiles
where role = 'student'
order by created_at desc;
```

### 7.3 View Only Teachers

```sql
select *
from public.profiles
where role = 'teacher'
order by created_at desc;
```

### 7.4 Delete A User So They Can Re-Register

Best method:

1. Open Supabase.
2. Go to **Authentication**.
3. Click **Users**.
4. Find the user email.
5. Open the user.
6. Click **Delete user**.

Because the `profiles` table references `auth.users` with cascade delete, deleting the auth user should also delete the profile.

If a profile remains, run:

```sql
delete from public.profiles
where id = 'PASTE_USER_ID_HERE';
```

## 8. Vercel Deployment Manual

### 8.1 Add Environment Variables

1. Open Vercel.
2. Open the BioTutor project.
3. Go to **Settings**.
4. Click **Environment Variables**.
5. Add each variable name and value.
6. Select **Production**, **Preview**, and **Development** if needed.
7. Save.
8. Redeploy the project.

### 8.2 Redeploy On Vercel

1. Open Vercel project.
2. Go to **Deployments**.
3. Click the latest deployment menu.
4. Click **Redeploy**.
5. Wait until deployment says **Ready**.
6. Open the live URL and test.

## 9. Offline Access

BioTutor has PWA support. Students can reopen previously loaded pages when offline if the browser has cached them.

For best offline use:

1. Open the app while online.
2. Open the lessons needed.
3. Let the pages load completely.
4. Later, reopen those pages offline.

Progress sync needs internet connection.

## 10. Troubleshooting

### Login Says Invalid Credentials

Check:

- Email and password are correct.
- User exists under Supabase Authentication > Users.
- Email has been confirmed if confirmation is enabled.
- Student/teacher selected the correct role tab.

### Teacher Changes Not Showing For Students

Check:

- Teacher clicked **Approve for students**.
- Vercel has `SUPABASE_SERVICE_ROLE_KEY`.
- The publish message says the lesson was published online.
- Student refreshed the lesson page.
- The lesson exists in Supabase `lessons` with `published = true` and `approval_status = approved`.

### Gemini AI Tutor Not Working

Check:

- `GEMINI_API_KEY` exists in Vercel environment variables.
- It is not prefixed with `NEXT_PUBLIC_`.
- Vercel was redeployed after adding the key.
- The user is asking a Biology question.

### Supabase Not Connected

Check:

- `NEXT_PUBLIC_SUPABASE_URL` is correct.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct.
- `SUPABASE_SERVICE_ROLE_KEY` is correct for server publishing.
- Supabase project is active.
- SQL schema has been run.

### Quiz Does Not Show 20 Questions

Check:

- The latest Vercel deployment is live.
- The code includes `lib/starter-questions.ts`.
- Teacher-published quiz has exactly 20 complete questions.
- Refresh the quiz page.

## 11. Recommended Daily Use

For students:

1. Log in.
2. Open the next recommended lesson.
3. Read the content.
4. Ask BioTutor questions.
5. Complete the quiz.
6. Review feedback.
7. Retry if needed.

For teachers:

1. Check lesson content.
2. Approve updates for students.
3. Review quiz results and analytics.
4. Identify weak students.
5. Add remediation activities where needed.

## 12. Important Safety Notes

- Do not share Supabase service role keys with students or teachers.
- Do not put secret keys inside frontend code.
- Use strong passwords for teacher/admin accounts.
- Delete test users from Supabase Authentication if they need to re-register.
- Keep Row Level Security enabled in Supabase.

