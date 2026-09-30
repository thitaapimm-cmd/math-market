import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Level2Page from "./page";

const { mockPlaySoundEffect, mockSpeakThai, mockCelebrateCorrect } = vi.hoisted(
  () => ({
    mockPlaySoundEffect: vi.fn(),
    mockSpeakThai: vi.fn(),
    mockCelebrateCorrect: vi.fn(),
  }),
);

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/storage", () => ({
  api: {
    getCurrentStudent: () => ({ id: "student-1", name: "ทดสอบ" }),
    recordAttempt: vi.fn(),
    completeLevel: vi.fn(),
  },
}));
vi.mock("@/lib/speech", () => ({
  speakThai: mockSpeakThai,
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
      say: (text: string) => { mockSpeakThai(text); return Promise.resolve("ended"); },
    };
  },
}));
vi.mock("@/lib/celebration", () => ({
  celebrateCorrect: mockCelebrateCorrect,
  celebrateCompletion: vi.fn(),
}));

describe("Level 2 answer confirmation", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });
  beforeEach(() => {
    vi.clearAllMocks();
    promptMarker.current = "";
    vi.spyOn(Math, "random").mockReturnValue(0.999);
  });

  it("reads a selected coin and waits for confirmation before checking", async () => {
    const user = userEvent.setup();
    render(<Level2Page />);

    await user.click(
      await screen.findByRole("button", { name: "เงิน 10 บาท" }),
    );
    expect(mockCelebrateCorrect).not.toHaveBeenCalled();
    expect(mockSpeakThai).toHaveBeenCalledWith("เหรียญ 10 บาท");

    await user.click(screen.getByRole("button", { name: "ยืนยันคำตอบ" }));
    expect(mockPlaySoundEffect).toHaveBeenLastCalledWith("correct");
    expect(mockCelebrateCorrect).toHaveBeenCalledOnce();
    expect(mockSpeakThai).toHaveBeenCalledWith(
      expect.stringContaining("ถูกต้อง"),
    );
  });

  it("reads each item question automatically and speaks its exact visible hint", async () => {
    const user = userEvent.setup();
    render(<Level2Page />);

    const prompt = "ไก่ทอด ราคา 10 บาท หนูจะเลือกเงินใบไหน?";
    await waitFor(() => expect(mockSpeakThai).toHaveBeenCalledWith(prompt));
    await user.click(await screen.findByRole("button", { name: "เงิน 20 บาท" }));
    await user.click(screen.getByRole("button", { name: "ยืนยันคำตอบ" }));

    const hint = "ไก่ทอด ราคา 10 บาท ให้เลือกเงิน 10 บาท";
    expect(screen.getByText(`💡 คำใบ้: ${hint}`)).toBeInTheDocument();
    expect(mockSpeakThai).toHaveBeenLastCalledWith(hint);
  });
});
