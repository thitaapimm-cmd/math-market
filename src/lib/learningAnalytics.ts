import type { Attempt } from "@/types";

export function formatDuration(seconds?: number): string {
  if (seconds === undefined) return "-";
  const safe = Math.max(0, Math.round(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

export function formatAnswer(answer: string | number | number[]): string {
  if (Array.isArray(answer)) return answer.length ? `${answer.join(" + ")} บาท` : "-";
  return typeof answer === "number" ? `${answer} บาท` : answer || "-";
}

export function getLatestAttemptByLevel(
  attempts: readonly Attempt[], studentId: string, level: number,
): Attempt | undefined {
  return attempts
    .filter((attempt) => attempt.student_id === studentId && attempt.level === level)
    .sort((a, b) => Date.parse(b.completed_at ?? b.created_at) - Date.parse(a.completed_at ?? a.created_at))[0];
}
