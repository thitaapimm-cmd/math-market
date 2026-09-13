import { beforeEach, describe, expect, it } from "vitest";
import { api } from "@/lib/storage";

describe("api.addStudent", () => {
  beforeEach(() => localStorage.clear());

  it("starts with no mock students in fresh storage", () => {
    expect(api.getStudents()).toEqual([]);
    expect(JSON.parse(localStorage.getItem("math_market_students") || "null")).toEqual([]);
  });

  it("removes legacy mock students while preserving created students", () => {
    const created = {
      id: "std_created",
      student_code: "NEW-1",
      name: "น้องมะลิ",
      classroom: "",
      avatar_url: "/avatars/student-01.png",
      created_at: "2026-09-13T00:00:00.000Z",
    };
    localStorage.setItem(
      "math_market_students",
      JSON.stringify([
        { ...created, id: "std_1", student_code: "101", name: "น้องตะวัน", avatar_url: "👦" },
        created,
      ]),
    );

    expect(api.getStudents()).toEqual([created]);
    expect(JSON.parse(localStorage.getItem("math_market_students") || "null")).toEqual([created]);
  });

  it("appends a student without removing existing students", () => {
    const existing = api.getStudents();
    const created = api.addStudent({
      name: "น้องมะลิ",
      avatar_url: "/avatars/student-01.png",
    });

    expect(created.name).toBe("น้องมะลิ");
    expect(created.avatar_url).toBe("/avatars/student-01.png");
    expect(created.id).toMatch(/^std_/);
    expect(api.getStudents()).toEqual([...existing, created]);
  });

  it("rejects a blank or whitespace-only student name", () => {
    expect(() =>
      api.addStudent({ name: " \t\n ", avatar_url: "/avatars/student-01.png" }),
    ).toThrow(/name/i);
  });

  it("rejects an avatar URL outside the approved preset paths", () => {
    expect(() =>
      api.addStudent({ name: "น้องมะลิ", avatar_url: "https://example.com/avatar.png" }),
    ).toThrow(/avatar/i);
  });

  it("trims surrounding whitespace from a student name", () => {
    const created = api.addStudent({
      name: "  น้องมะลิ  ",
      avatar_url: "/avatars/student-01.png",
    });

    expect(created.name).toBe("น้องมะลิ");
  });

  it("generates a student code for each new student", () => {
    const created = api.addStudent({
      name: "น้องมะลิ",
      avatar_url: "/avatars/student-01.png",
    });

    expect(created.student_code).toMatch(/^NEW-\d+$/);
  });

  it("generates an ISO creation timestamp for each new student", () => {
    const created = api.addStudent({
      name: "น้องมะลิ",
      avatar_url: "/avatars/student-01.png",
    });

    expect(created.created_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
    expect(Number.isNaN(Date.parse(created.created_at))).toBe(false);
  });
});

describe("api attempts", () => {
  beforeEach(() => localStorage.clear());

  it("continues to load attempts saved before detailed analytics fields existed", () => {
    const legacyAttempt = {
      id: "att-old",
      student_id: "student-1",
      level: 2,
      activity_type: "match_price",
      mode: "learning",
      score: 4,
      total_questions: 5,
      hint_count: 1,
      duration_seconds: 35,
      answers: [],
      created_at: "2026-09-13T00:00:00.000Z",
    };
    localStorage.setItem("math_market_attempts", JSON.stringify([legacyAttempt]));

    expect(api.getAttempts("student-1")).toEqual([legacyAttempt]);
  });
});

describe("api.deleteStudent", () => {
  beforeEach(() => localStorage.clear());

  it("deletes one student and only that student's related records", () => {
    const studentA = {
      id: "student-a",
      student_code: "A",
      name: "น้องเอ",
      classroom: "",
      avatar_url: "/avatars/student-01.png",
      created_at: "2026-09-13T00:00:00.000Z",
    };
    const studentB = { ...studentA, id: "student-b", student_code: "B", name: "น้องบี" };
    const progressA = { student_id: "student-a", level: 1, status: "completed", best_score: 5, first_score: 5, attempt_count: 1 };
    const progressB = { ...progressA, student_id: "student-b" };
    const assessmentA = { id: "assessment-a", student_id: "student-a", assessment_type: "pretest", score: 5, total_score: 5, created_at: "2026-09-13T00:00:00.000Z" };
    const assessmentB = { ...assessmentA, id: "assessment-b", student_id: "student-b" };
    const attemptA = { id: "attempt-a", student_id: "student-a", level: 1, activity_type: "test", mode: "learning", score: 5, total_questions: 5, hint_count: 0, duration_seconds: 20, answers: [], created_at: "2026-09-13T00:00:00.000Z" };
    const attemptB = { ...attemptA, id: "attempt-b", student_id: "student-b" };
    localStorage.setItem("math_market_students", JSON.stringify([studentA, studentB]));
    localStorage.setItem("math_market_progress", JSON.stringify([progressA, progressB]));
    localStorage.setItem("math_market_assessments", JSON.stringify([assessmentA, assessmentB]));
    localStorage.setItem("math_market_attempts", JSON.stringify([attemptA, attemptB]));
    localStorage.setItem("math_market_current_student", JSON.stringify(studentA));

    api.deleteStudent("student-a");

    expect(api.getStudents()).toEqual([studentB]);
    expect(JSON.parse(localStorage.getItem("math_market_progress") || "[]")).toEqual([progressB]);
    expect(api.getAssessments()).toEqual([assessmentB]);
    expect(api.getAttempts()).toEqual([attemptB]);
    expect(api.getCurrentStudent()).toBeNull();
  });

  it("does not clear a different current student", () => {
    const current = { id: "student-b", student_code: "B", name: "น้องบี", classroom: "", avatar_url: "/avatars/student-02.png", created_at: "2026-09-13T00:00:00.000Z" };
    localStorage.setItem("math_market_current_student", JSON.stringify(current));

    api.deleteStudent("student-a");

    expect(api.getCurrentStudent()).toEqual(current);
  });
});
