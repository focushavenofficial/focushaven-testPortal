export interface User {
  id: string;
  passcode: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
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
}

export interface TestResult {
  id: string;
  testId: string;
  userId: string;
  answers: Record<string, number>;
  score: number;
  completedAt: Date;
}