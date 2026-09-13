export type LevelStatus = "locked" | "in_progress" | "completed";

export interface Student {
  id: string;
  student_code: string;
  name: string;
  classroom: string;
  avatar_url: string;
  created_at: string;
}

export interface StudentProgress {
  student_id: string;
  level: number;
  status: LevelStatus;
  best_score: number;
  first_score: number;
  attempt_count: number;
  completed_at?: string;
}

export interface AttemptAnswer {
  question_id: string;
  answer: string | number | number[];
  correct: boolean;
  hint_used: boolean;
  prompt?: string;
  first_try_correct?: boolean;
  wrong_count?: number;
  duration_seconds?: number;
  steps?: AttemptAnswerStep[];
}

export interface AttemptAnswerStep {
  name: string;
  answer: string | number | number[];
  correct: boolean;
  wrong_count: number;
  duration_seconds: number;
}

export interface Attempt {
  id: string;
  student_id: string;
  level: number;
  activity_type: string;
  mode: "learning" | "practice";
  score: number;
  total_questions: number;
  hint_count: number;
  wrong_count?: number;
  duration_seconds: number;
  started_at?: string;
  completed_at?: string;
  answers: AttemptAnswer[];
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  emoji: string;
  image_url?: string;
  active: boolean;
  shop_ids: string[];
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  image_url: string;
  active: boolean;
}

export interface AssessmentResult {
  id: string;
  student_id: string;
  assessment_type: "pretest" | "posttest";
  score: number;
  total_score: number;
  created_at: string;
}
