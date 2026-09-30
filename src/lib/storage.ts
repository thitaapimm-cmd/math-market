import {
  Student,
  Shop,
  Product,
  StudentProgress,
  Attempt,
  AssessmentResult,
} from "@/types";
import { isStudentAvatarPresetPath } from "@/lib/studentAvatars";
import { PRODUCTS, SHOPS } from "@/lib/catalog";

const INITIAL_STUDENTS: Student[] = [];

export const getStorageData = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  const data = localStorage.getItem(`math_market_${key}`);
  if (!data) {
    localStorage.setItem(`math_market_${key}`, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
};

export const setStorageData = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(`math_market_${key}`, JSON.stringify(value));
};

const LEGACY_MOCK_STUDENTS = new Set([
  "std_1|101|น้องตะวัน",
  "std_2|102|น้องฟ้าใส",
  "std_3|103|น้องภูผา",
]);

const getStudents = (): Student[] => {
  const students = getStorageData("students", INITIAL_STUDENTS);
  const retained = students.filter(
    (student) =>
      !LEGACY_MOCK_STUDENTS.has(
        `${student.id}|${student.student_code}|${student.name}`,
      ),
  );
  if (retained.length !== students.length) setStorageData("students", retained);
  return retained;
};

// Data Access API
export const api = {
  getStudents,
  addStudent: (input: Pick<Student, "name" | "avatar_url">): Student => {
    if (!input.name.trim()) {
      throw new Error("Student name cannot be blank");
    }
    if (!isStudentAvatarPresetPath(input.avatar_url)) {
      throw new Error("Student avatar must use an approved preset path");
    }
    const students = getStudents();
    const uniquePart = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const student: Student = {
      id: `std_${uniquePart}`,
      student_code: `NEW-${Date.now()}`,
      name: input.name.trim(),
      classroom: "",
      avatar_url: input.avatar_url,
      created_at: new Date().toISOString(),
    };
    setStorageData("students", [...students, student]);
    return student;
  },
  getCurrentStudent: (): Student | null =>
    getStorageData("current_student", null),
  setCurrentStudent: (student: Student | null) =>
    setStorageData("current_student", student),
  deleteStudent: (studentId: string): void => {
    setStorageData(
      "students",
      getStudents().filter((student) => student.id !== studentId),
    );
    setStorageData(
      "progress",
      getStorageData<StudentProgress[]>("progress", []).filter(
        (progress) => progress.student_id !== studentId,
      ),
    );
    setStorageData(
      "assessments",
      getStorageData<AssessmentResult[]>("assessments", []).filter(
        (assessment) => assessment.student_id !== studentId,
      ),
    );
    setStorageData(
      "attempts",
      getStorageData<Attempt[]>("attempts", []).filter(
        (attempt) => attempt.student_id !== studentId,
      ),
    );
    const currentStudent = getStorageData<Student | null>("current_student", null);
    if (currentStudent?.id === studentId) {
      setStorageData("current_student", null);
    }
  },

  getShops: (): Shop[] => SHOPS,
  getProducts: (): Product[] => PRODUCTS,

  getProgress: (studentId: string): StudentProgress[] => {
    const all = getStorageData<StudentProgress[]>("progress", []);
    const studentProg = all.filter((p) => p.student_id === studentId);
    if (studentProg.length === 0) {
      const initial: StudentProgress[] = [
        {
          student_id: studentId,
          level: 1,
          status: "in_progress",
          best_score: 0,
          first_score: 0,
          attempt_count: 0,
        },
        {
          student_id: studentId,
          level: 2,
          status: "locked",
          best_score: 0,
          first_score: 0,
          attempt_count: 0,
        },
        {
          student_id: studentId,
          level: 3,
          status: "locked",
          best_score: 0,
          first_score: 0,
          attempt_count: 0,
        },
        {
          student_id: studentId,
          level: 4,
          status: "locked",
          best_score: 0,
          first_score: 0,
          attempt_count: 0,
        },
        {
          student_id: studentId,
          level: 5,
          status: "locked",
          best_score: 0,
          first_score: 0,
          attempt_count: 0,
        },
      ];
      setStorageData("progress", [...all, ...initial]);
      return initial;
    }
    return studentProg;
  },

  completeLevel: (studentId: string, level: number, score: number) => {
    // A learner may open a level directly before visiting the path page.
    api.getProgress(studentId);
    const all = getStorageData<StudentProgress[]>("progress", []);
    const updated = all.map((p) => {
      if (p.student_id === studentId && p.level === level) {
        return {
          ...p,
          status: "completed" as const,
          best_score: Math.max(p.best_score, score),
          first_score: p.attempt_count === 0 ? score : p.first_score,
          attempt_count: p.attempt_count + 1,
          completed_at: new Date().toISOString(),
        };
      }
      if (
        p.student_id === studentId &&
        p.level === level + 1 &&
        p.status === "locked"
      ) {
        return { ...p, status: "in_progress" as const };
      }
      return p;
    });
    setStorageData("progress", updated);
  },

  recordAttempt: (attempt: Omit<Attempt, "id" | "created_at">) => {
    const attempts = getStorageData<Attempt[]>("attempts", []);
    const newAttempt: Attempt = {
      ...attempt,
      id: "att_" + Date.now(),
      created_at: new Date().toISOString(),
    };
    setStorageData("attempts", [newAttempt, ...attempts]);
  },

  getAttempts: (studentId?: string): Attempt[] => {
    const attempts = getStorageData<Attempt[]>("attempts", []);
    return studentId
      ? attempts.filter((a) => a.student_id === studentId)
      : attempts;
  },

  recordAssessment: (res: Omit<AssessmentResult, "id" | "created_at">) => {
    const all = getStorageData<AssessmentResult[]>("assessments", []);
    const item: AssessmentResult = {
      ...res,
      id: "ass_" + Date.now(),
      created_at: new Date().toISOString(),
    };
    setStorageData("assessments", [...all, item]);
  },

  getAssessments: (studentId?: string): AssessmentResult[] => {
    const all = getStorageData<AssessmentResult[]>("assessments", []);
    return studentId ? all.filter((a) => a.student_id === studentId) : all;
  },
};
