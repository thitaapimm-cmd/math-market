import type { Attempt, AttemptAnswer } from "@/types";

export function shuffleQuestions<T>(
  items: readonly T[],
  random: () => number = Math.random,
  limit = 5,
): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result.slice(0, limit);
}

export function secondsBetween(start: number, end: number): number {
  return Math.max(0, Math.round((end - start) / 1000));
}

export interface NormalizedAttempt
  extends Omit<
    Attempt,
    "wrong_count" | "started_at" | "completed_at" | "answers"
  > {
  wrong_count: number;
  started_at: string;
  completed_at: string;
  answers: Array<
    AttemptAnswer & {
      prompt: string;
      first_try_correct: boolean;
      wrong_count: number;
      duration_seconds: number;
    }
  >;
}

export function normalizeAttempt(attempt: Attempt): NormalizedAttempt {
  return {
    ...attempt,
    wrong_count: attempt.wrong_count ?? attempt.hint_count ?? 0,
    started_at: attempt.started_at ?? attempt.created_at,
    completed_at: attempt.completed_at ?? attempt.created_at,
    answers: (attempt.answers ?? []).map((answer) => ({
      ...answer,
      prompt: answer.prompt ?? answer.question_id,
      first_try_correct: answer.first_try_correct ?? answer.correct,
      wrong_count: answer.wrong_count ?? (answer.hint_used ? 1 : 0),
      duration_seconds: answer.duration_seconds ?? 0,
    })),
  };
}

export type AssessmentTone = "slate" | "emerald" | "amber" | "rose";

export function getPreliminaryAssessment(score?: number): {
  label: string;
  tone: AssessmentTone;
} {
  if (score === undefined) return { label: "รอประเมิน", tone: "slate" };
  if (score >= 4) return { label: "พร้อมเรียนต่อ", tone: "emerald" };
  if (score >= 2) return { label: "กำลังพัฒนา", tone: "amber" };
  return { label: "ควรฝึกเพิ่มเติม", tone: "rose" };
}
