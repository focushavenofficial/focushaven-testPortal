export interface User {
  id: string;
  passcode: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  class?: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'fill-in-blank';
  expectedAnswer?: string; // For short-answer and fill-in-blank questions
}

export interface Test {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  questions: Question[];
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
  targetClass?: number; // null/undefined means available to all classes
}

export interface TestResult {
  id: string;
  testId: string;
  userId: string;
  answers: Record<string, number | string>; // Support both numeric and text answers
  score: number;
  completedAt: Date;
  detailedResults?: {
    questionId: string;
    userAnswer: number | string;
    correctAnswer: number | string;
    isCorrect: boolean;
    similarityScore?: number; // For AI-checked answers
  }[];
}