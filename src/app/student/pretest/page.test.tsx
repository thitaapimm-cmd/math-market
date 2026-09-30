import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PretestPage from "./page";

const { mockPlaySoundEffect, mockSpeakThai, mockSpeakThaiAndWait, mockRecordAssessment, mockRecordAttempt } = vi.hoisted(() => ({
  mockPlaySoundEffect: vi.fn(),
  mockSpeakThai: vi.fn(),
  mockSpeakThaiAndWait: vi.fn(),
  mockRecordAssessment: vi.fn(),
  mockRecordAttempt: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/storage", () => ({
  api: {
    getCurrentStudent: () => ({ id: "student-1", name: "ทดสอบ" }),
    recordAssessment: mockRecordAssessment,
    recordAttempt: mockRecordAttempt,
  },
}));
vi.mock("@/lib/speech", () => ({
  speakThai: mockSpeakThai,
  speakThaiAndWait: mockSpeakThaiAndWait,
  playSoundEffect: mockPlaySoundEffect,
}));
const { promptMarker } = vi.hoisted(() => ({ promptMarker: { current: "" } }));
vi.mock("@/lib/useLessonAudio", () => ({
  useLessonAudio: (prompt: string, key: string, enabled: boolean) => {
    if (enabled && promptMarker.current !== key) {
      promptMarker.current = key;
      mockSpeakThai(prompt);
    }
    return {
      locked: false, audioUnavailable: false, isBusy: () => false,
      replay: () => mockSpeakThai(prompt),
      say: (text: string) => { mockSpeakThai(text); return mockSpeakThaiAndWait(text).then(() => "ended"); },
    };
  },
}));
vi.mock("@/lib/celebration", () => ({
  celebrateCorrect: vi.fn(),
  celebrateCompletion: vi.fn(),
}));

describe("Pretest answer confirmation", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
  beforeEach(() => {
    vi.clearAllMocks();
    promptMarker.current = "";
    mockSpeakThaiAndWait.mockResolvedValue(undefined);
    vi.spyOn(Math, "random").mockReturnValue(0.999);
  });

  it("keeps the current question until the selected answer is confirmed", async () => {
    const user = userEvent.setup();
    render(<PretestPage />);

    await user.click(await screen.findByRole("button", { name: "10 บาท" }));
    expect(screen.getByText("ข้อที่ 1 จาก 5")).toBeInTheDocument();
    expect(mockPlaySoundEffect).toHaveBeenLastCalledWith("click");
    expect(mockSpeakThai).toHaveBeenCalledWith("เหรียญ 10 บาท");

    await user.click(screen.getByRole("button", { name: "ยืนยันคำตอบ" }));
    expect(mockPlaySoundEffect).toHaveBeenLastCalledWith("correct");
    expect(mockSpeakThaiAndWait).toHaveBeenCalledWith(
      expect.stringContaining("ถูกต้อง"),
    );
  });

  it("shows and speaks the exact hint after a wrong confirmation", async () => {
    mockSpeakThaiAndWait.mockImplementation(() => new Promise<void>(() => undefined));
    const user = userEvent.setup();
    render(<PretestPage />);

    await waitFor(() =>
      expect(mockSpeakThai).toHaveBeenCalledWith("นี่คือเงินกี่บาท?"),
    );
    await user.click(await screen.findByRole("button", { name: "5 บาท" }));
    await user.click(screen.getByRole("button", { name: "ยืนยันคำตอบ" }));

    const hint = "สังเกตตัวเลข 10 บนเหรียญนะจ๊ะ";
    expect(screen.getByRole("status")).toHaveTextContent(hint);
    expect(mockSpeakThaiAndWait).toHaveBeenLastCalledWith(hint);
  });

  it("records timing and answer details for all five questions", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-13T00:00:00.000Z"));
    render(<PretestPage />);
    await act(async () => undefined);

    for (const answer of [10, 20, 10, 15, 25]) {
      await act(async () => vi.advanceTimersByTime(1000));
      fireEvent.click(screen.getByRole("button", { name: `${answer} บาท` }));
      fireEvent.click(screen.getByRole("button", { name: "ยืนยันคำตอบ" }));
      await act(async () => Promise.resolve());
    }

    expect(mockRecordAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 0,
        activity_type: "pretest",
        score: 5,
        total_questions: 5,
        wrong_count: 0,
        duration_seconds: 5,
        answers: expect.arrayContaining([
          expect.objectContaining({
            question_id: "q1",
            first_try_correct: true,
            wrong_count: 0,
            duration_seconds: expect.any(Number),
          }),
        ]),
      }),
    );
    expect(mockRecordAssessment).toHaveBeenCalledWith(
      expect.objectContaining({ score: 5, total_score: 5 }),
    );
  });

  it("checks the displayed shuffled question and does not show a hint for its correct answer", async () => {
    mockSpeakThaiAndWait.mockImplementation(() => new Promise<void>(() => undefined));
    vi.mocked(Math.random).mockReturnValue(0);
    const user = userEvent.setup();
    render(<PretestPage />);

    expect(await screen.findByText("ธนบัตรนี้มีค่ากี่บาท?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "20 บาท" }));
    await user.click(screen.getByRole("button", { name: "ยืนยันคำตอบ" }));

    expect(screen.getByRole("status")).toHaveTextContent("ถูกต้อง");
    expect(screen.getByRole("status")).not.toHaveTextContent("คำใบ้");
  });

  it("keeps the same question visible until feedback audio finishes", async () => {
    let finishAudio: (() => void) | undefined;
    mockSpeakThaiAndWait.mockImplementation(() => new Promise<void>((resolve) => { finishAudio = resolve; }));
    const user = userEvent.setup();
    render(<PretestPage />);

    await user.click(await screen.findByRole("button", { name: "10 บาท" }));
    await user.click(screen.getByRole("button", { name: "ยืนยันคำตอบ" }));
    expect(screen.getByText("ข้อที่ 1 จาก 5")).toBeInTheDocument();

    finishAudio?.();
    expect(await screen.findByText("ข้อที่ 2 จาก 5")).toBeInTheDocument();
  });
});
