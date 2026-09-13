import { describe, expect, it } from "vitest";
import type { Attempt } from "@/types";
import {
  getPreliminaryAssessment,
  normalizeAttempt,
  secondsBetween,
  shuffleQuestions,
} from "@/lib/learningSession";

describe("learning session utilities", () => {
  it("shuffles a copy without mutating the source", () => {
    const source = [1, 2, 3, 4, 5];

    expect(shuffleQuestions(source, () => 0)).toEqual([2, 3, 4, 5, 1]);
    expect(source).toEqual([1, 2, 3, 4, 5]);
  });

  it("limits a session to five shuffled questions", () => {
    expect(shuffleQuestions([1, 2, 3, 4, 5, 6], () => 0, 5)).toHaveLength(5);
  });

  it("rounds elapsed milliseconds into non-negative seconds", () => {
    expect(secondsBetween(1_000, 76_000)).toBe(75);
    expect(secondsBetween(2_000, 1_000)).toBe(0);
  });

  it("normalizes legacy attempts for analytics", () => {
    const legacyAttempt: Attempt = {
      id: "legacy",
      student_id: "student-1",
      level: 1,
      activity_type: "identify_money",
      mode: "learning",
      score: 3,
      total_questions: 5,
      hint_count: 0,
      duration_seconds: 30,
      answers: [],
      created_at: "2026-09-13T00:00:00.000Z",
    };

    expect(normalizeAttempt(legacyAttempt)).toMatchObject({
      wrong_count: 0,
      started_at: "2026-09-13T00:00:00.000Z",
      completed_at: "2026-09-13T00:00:00.000Z",
      answers: [],
    });
  });

  it.each([
    [5, "พร้อมเรียนต่อ"],
    [3, "กำลังพัฒนา"],
    [1, "ควรฝึกเพิ่มเติม"],
    [undefined, "รอประเมิน"],
  ])("maps score %s to %s", (score, label) => {
    expect(getPreliminaryAssessment(score).label).toBe(label);
  });
});
