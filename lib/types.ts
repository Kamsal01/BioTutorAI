export type Role = "student" | "teacher";
export type Difficulty = "easy" | "medium" | "hard";

export type Topic = {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: number;
  estimatedMinutes: number;
  icon: string;
};

export type Question = {
  id: string;
  topicSlug: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
};

export type Lesson = {
  id: string;
  topicSlug: string;
  title: string;
  objectives: string[];
  introduction: string;
  content: string[];
  keyTerms: { term: string; meaning: string }[];
  diagramPrompt: string;
  activity: string;
  remediation: string;
  summary: string;
  questions: Question[];
};

export type StudentProgress = {
  topicSlug: string;
  completion: number;
  bestScore: number;
  timeSpentMinutes: number;
  mastery: "needs-remediation" | "developing" | "mastered";
};
