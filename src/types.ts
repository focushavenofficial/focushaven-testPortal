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
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'fill-in-blank' | 'real-number';
  expectedAnswer?: string; // For short-answer and fill-in-blank questions
  correctNumber?: number; // For real-number questions
  marks?: number; // Marks for the question (default 1)
  subject?: string; // Subject code for the question
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
  subject?: string; // Subject code from subList
}

export interface TestResult {
  id: string;
  testId: string;
  userId: string;
  answers: Record<string, number | string>; // Support both numeric and text answers
  score: number;
  completedAt: Date;
  startedAt: Date;
  timeSpent: number; // in seconds
  reviewedQuestions?: string[]; // Array of question IDs that were reviewed
  detailedResults?: {
    questionId: string;
    userAnswer: number | string;
    correctAnswer: number | string;
    isCorrect: boolean;
    similarityScore?: number; // For AI-checked answers
    marksAwarded?: number; // Marks awarded for this question
  }[];
}

export interface ReviewRequest {
  id: string;
  testResultId: string;
  questionId: string;
  userId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
}

export interface QuestionState {
  answered: boolean;
  reviewed: boolean;
  selected: boolean;
}