# BioTutor ITS User Manual

## 1. What BioTutor ITS Is

BioTutor ITS is a Biology Intelligent Tutoring System for secondary school students and Biology teachers. Students read Biology lessons, ask an AI tutor questions, take quizzes, earn XP, and track progress. Teachers manage lessons, upload pictures, add H5P-style activities, publish quizzes, and monitor learning.

The system has two main user roles:

- Student: learns Biology, uses the AI tutor, takes quizzes, and tracks progress.
- Teacher: manages lesson content, uploads images, creates quizzes, and views analytics.

## 2. First-Time Setup For The School/Admin

Before students and teachers use the online app, confirm these are ready:

1. Firebase project is created.
2. Firebase Email/Password Authentication is enabled.
3. Firestore Database is created.
4. Firebase Storage is enabled.
5. Firebase environment variables are added in Vercel.
6. Vercel has redeployed successfully.
7. Teacher accounts have role `teacher` in their Firestore profile document.
8. Student accounts have role `student` in their Firestore profile document.

Required Vercel environment variables:

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
GEMINI_API_KEY
GEMINI_MODEL
NEXT_PUBLIC_APP_URL
```

Important: `GEMINI_API_KEY` must not start with `NEXT_PUBLIC_`.

## 3. Firebase Setup

### 3.1 Create Firebase Project

1. Go to Firebase Console.
2. Click **Add project**.
3. Create or select a Google Analytics option.
4. Finish project setup.

### 3.2 Create Web App

1. In Firebase project overview, click the web icon `</>`.
2. Register the app name, for example `BioTutor ITS`.
3. Copy the Firebase config values.
4. Add those values to `.env.local` locally and to Vercel environment variables online.

### 3.3 Enable Authentication

1. Go to **Build > Authentication**.
2. Click **Get started**.
3. Open **Sign-in method**.
4. Enable **Email/Password**.
5. Save.

### 3.4 Create Firestore Database

1. Go to **Build > Firestore Database**.
2. Click **Create database**.
3. Choose production mode or test mode for setup.
4. Select a region.
5. Create the database.
6. Add the rules from `firebase-firestore.rules`.

### 3.5 Enable Firebase Storage

1. Go to **Build > Storage**.
2. Click **Get started**.
3. Create the default bucket.
4. Add the rules from `firebase-storage.rules`.

## 4. How To Register

1. Open the BioTutor ITS website.
2. Click **Create an account**.
3. Enter full name, email, and password.
4. Choose **Student** or **Teacher**.
5. Submit the form.

The app creates:

- A Firebase Auth account.
- A Firestore document in `profiles/{userId}`.

If registration fails, check that Firebase Auth Email/Password is enabled and Firebase environment variables are correct.

## 5. How To Log In

1. Open `/login`.
2. Enter email and password.
3. Select the correct role tab.
4. Click **Sign in**.

After login:

- Students go to `/student`.
- Teachers go to `/teacher`.

If login fails, check:

- The user exists in Firebase Authentication.
- The email and password are correct.
- Firebase environment variables are correct in Vercel.
- Vercel was redeployed after adding Firebase variables.

## 6. Student Manual

### 6.1 Student Dashboard

The dashboard shows:

- Biology lesson topics
- XP points
- Level
- Daily streak
- Badges
- Recommended next lesson
- Learning history
- Progress for each topic

Students should start from Lesson One and continue lesson by lesson.

### 6.2 Opening A Lesson

1. Log in as a student.
2. Open the student dashboard.
3. Click a lesson topic.
4. Read objectives and lesson content.
5. Review diagrams and lesson pictures.
6. Complete H5P-style activities.
7. Use remediation if needed.
8. Click **Take quiz**.

### 6.3 Taking A Quiz

Each lesson has 20 multiple-choice questions.

1. Open a lesson.
2. Click **Take quiz**.
3. Choose one answer for each question.
4. Submit the quiz.
5. Review score and feedback.
6. If score is below 50%, review and retry.
7. If score is 50% or above, progress is saved locally and shown on the dashboard.

### 6.4 Using The AI Tutor

1. Open **AI Tutor** or `/tutor`.
2. Ask a Biology question naturally.
3. Ask follow-ups like:

```text
Explain reproduction
Break it down
Give examples
Explain like a child
Quiz me
What is the difference between birds and mammals?
```

BioTutor should answer Biology questions conversationally and politely refuse non-Biology questions.

### 6.5 Editing Student Profile

1. Open **Profile**.
2. Edit name, school, class level, and bio.
3. Upload a profile picture if desired.
4. Save changes.

Profile information syncs to Firestore when Firebase is connected. Pictures sync to Firebase Storage.

## 7. Teacher Manual

### 7.1 Teacher Dashboard

Teachers can access:

- Lesson management
- Quiz management
- Analytics
- Student monitoring
- Profile page

### 7.2 Editing Lessons

1. Log in as a teacher.
2. Open `/teacher/lessons`.
3. Select a lesson.
4. Edit title, introduction, objectives, content, key terms, activity, remediation, and summary.
5. Upload a lesson picture if needed.
6. Add H5P-style activities if needed.
7. Click **Save draft** to save on the current browser.
8. Click **Approve for students** to publish online to Firestore.

Students in other browsers see changes after publishing succeeds and they refresh the lesson page.

### 7.3 Adding H5P-Style Activities

Teachers can add:

- Multiple choice
- Flashcards
- Fill in the blank
- Drag and sort

Fill in title, prompt, answer, and options/items, then approve the lesson for students.

### 7.4 Creating Or Uploading Quizzes

1. Open `/teacher/quizzes`.
2. Select a lesson/module.
3. Add or edit questions.
4. Make sure there are exactly 20 complete MCQs.
5. Click **Publish 20 questions**.

Each question needs:

- Question text
- Four options
- Correct answer
- Explanation
- Difficulty level

Published quizzes are saved in Firestore under `quizzes/{topicSlug}`.

## 8. Firebase Admin Manual

### 8.1 View Registered Users

To see login accounts:

1. Open Firebase Console.
2. Go to **Build > Authentication**.
3. Click **Users**.

To see roles and profile data:

1. Go to **Build > Firestore Database**.
2. Open the `profiles` collection.
3. Open a user document.
4. Check the `role` field.

### 8.2 Make A User A Teacher

1. Open Firestore Database.
2. Open `profiles`.
3. Find the user document.
4. Set `role` to `teacher`.
5. Save.

### 8.3 Delete A User So They Can Re-Register

1. Go to **Authentication > Users**.
2. Find the user email.
3. Delete the user.
4. Go to Firestore `profiles`.
5. Delete the matching profile document if it still exists.

After that, the user can register again with the same email.

## 9. Vercel Deployment Manual

### 9.1 Add Environment Variables

1. Open Vercel.
2. Open the BioTutor project.
3. Go to **Settings > Environment Variables**.
4. Add every Firebase and Gemini variable.
5. Select Production, Preview, and Development as needed.
6. Save.
7. Redeploy.

### 9.2 Redeploy On Vercel

1. Open Vercel project.
2. Go to **Deployments**.
3. Click the latest deployment menu.
4. Click **Redeploy**.
5. Wait until deployment says **Ready**.
6. Open the live URL and test.

## 10. Offline Access

BioTutor has PWA support. Students can reopen previously loaded pages offline if the browser cached them.

For best offline use:

1. Open the app while online.
2. Open needed lessons.
3. Let the pages load fully.
4. Reopen those pages offline later.

Progress sync and AI tutor need internet connection.

## 11. Troubleshooting

### Login Says Invalid Details

Check:

- Email and password are correct.
- User exists in Firebase Authentication.
- Email/Password sign-in is enabled.
- Firebase environment variables are correct.
- Vercel was redeployed after changing variables.

### Teacher Changes Not Showing For Students

Check:

- Teacher clicked **Approve for students**.
- Firestore rules allow teacher writes.
- A document exists in `lessons/{topicSlug}`.
- The lesson document has `published = true` and `approvalStatus = approved`.
- Student refreshed the lesson page.

### Published Quiz Not Showing

Check:

- Teacher clicked **Publish 20 questions**.
- Firestore has `quizzes/{topicSlug}`.
- The quiz document has `published = true`.
- The quiz has exactly 20 complete questions.

### Gemini AI Tutor Not Working

Check:

- `GEMINI_API_KEY` exists in Vercel.
- It is not prefixed with `NEXT_PUBLIC_`.
- Vercel was redeployed after adding the key.
- The question is a Biology question.

### Firebase Not Connected

Check:

- All `NEXT_PUBLIC_FIREBASE_*` variables are correct.
- Firebase Auth Email/Password is enabled.
- Firestore Database exists.
- Storage bucket exists.
- Vercel was redeployed.

## 12. Recommended Daily Use

For students:

1. Log in.
2. Open the next lesson.
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

## 13. Important Safety Notes

- Do not share Firebase project credentials with students.
- Do not expose Gemini API keys with `NEXT_PUBLIC_`.
- Use strong passwords for teacher/admin accounts.
- Keep Firestore and Storage rules restricted before classroom use.
- Delete test users from Firebase Authentication if they need to re-register.
