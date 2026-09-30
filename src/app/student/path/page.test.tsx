import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LearningPathPage from "./page";

const { mockPush, mockGetCurrentStudent, mockGetProgress, mockSpeakThai, mockPlaySoundEffect } =
  vi.hoisted(() => ({
    mockPush: vi.fn(),
    mockGetCurrentStudent: vi.fn(),
    mockGetProgress: vi.fn(),
    mockSpeakThai: vi.fn(),
    mockPlaySoundEffect: vi.fn(),
  }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/storage", () => ({
  api: {
    getCurrentStudent: mockGetCurrentStudent,
    getProgress: mockGetProgress,
  },
}));

vi.mock("@/lib/speech", () => ({
  speakThai: mockSpeakThai,
  playSoundEffect: mockPlaySoundEffect,
}));

describe("LearningPathPage", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentStudent.mockReturnValue({
      id: "student-1",
      student_code: "101",
      name: "ด.ช. ทดสอบ",
      classroom: "ป.2/1",
      avatar_url: "🌞",
      created_at: "2026-09-13T00:00:00.000Z",
    });
    mockGetProgress.mockReturnValue([
      { student_id: "student-1", level: 1, status: "completed", best_score: 5, first_score: 5, attempt_count: 1 },
      { student_id: "student-1", level: 2, status: "in_progress", best_score: 0, first_score: 0, attempt_count: 0 },
      { student_id: "student-1", level: 3, status: "locked", best_score: 0, first_score: 0, attempt_count: 0 },
      { student_id: "student-1", level: 4, status: "locked", best_score: 0, first_score: 0, attempt_count: 0 },
      { student_id: "student-1", level: 5, status: "locked", best_score: 0, first_score: 0, attempt_count: 0 },
    ]);
  });

  it("shows the five-level path with progress, descriptions, and states", async () => {
    render(<LearningPathPage />);

    expect(await screen.findByText("1 / 5 ระดับ")).toBeInTheDocument();
    expect(screen.getByText("แยกแยะเหรียญ 5, 10 และธนบัตร 20, 50, 100")).toBeInTheDocument();
    expect(screen.getAllByText(/ผ่านแล้ว/)).toHaveLength(1);
    expect(screen.getAllByText(/กำลังเรียน/)).toHaveLength(1);
    expect(screen.getAllByText(/ยังล็อก/)).toHaveLength(3);
    expect(screen.getByRole("button", { name: /ระดับ 3/ })).toBeDisabled();
  });

  it("plays click feedback before opening an enabled level", async () => {
    const user = userEvent.setup();
    render(<LearningPathPage />);

    await user.click(await screen.findByRole("button", { name: /ระดับ 2/ }));

    expect(mockPlaySoundEffect).toHaveBeenCalledWith("click");
    expect(mockPush).toHaveBeenCalledWith("/student/level/2");
  });

  it("does not show a dedicated listen button", async () => {
    render(<LearningPathPage />);

    await screen.findByText("1 / 5 ระดับ");
    expect(screen.queryByRole("button", { name: "ฟัง" })).not.toBeInTheDocument();
  });
});
