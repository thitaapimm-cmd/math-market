import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Level1Page from "./page";

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
vi.mock("@/lib/celebration", () => ({
  celebrateCorrect: mockCelebrateCorrect,
  celebrateCompletion: vi.fn(),
}));

describe("Level 1 answer confirmation", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Math, "random").mockReturnValue(0.999);
  });

  it("selects an answer first and checks it only after confirmation", async () => {
    const user = userEvent.setup();
    render(<Level1Page />);

    expect(screen.queryByRole("button", { name: /ฟังเสียง/ })).not.toBeInTheDocument();
    await user.click(await screen.findByRole("button", { name: "10 บาท" }));
    expect(mockCelebrateCorrect).not.toHaveBeenCalled();
    expect(mockSpeakThai).toHaveBeenCalledWith("เหรียญ 10 บาท");

    await user.click(screen.getByRole("button", { name: "ยืนยันคำตอบ" }));
    expect(mockPlaySoundEffect).toHaveBeenLastCalledWith("correct");
    expect(mockCelebrateCorrect).toHaveBeenCalledOnce();
    expect(mockSpeakThai).toHaveBeenCalledWith(
      expect.stringContaining("ถูกต้อง"),
    );
  });

  it("reads the question automatically and speaks the exact visible hint", async () => {
    const user = userEvent.setup();
    render(<Level1Page />);

    await waitFor(() =>
      expect(mockSpeakThai).toHaveBeenCalledWith("เงินนี้มีค่าเท่าไร?"),
    );
    await user.click(await screen.findByRole("button", { name: "5 บาท" }));
    await user.click(screen.getByRole("button", { name: "ยืนยันคำตอบ" }));

    const hint = "สังเกตตัวเลข 10 บนเหรียญนะจ๊ะ";
    expect(screen.getByText(`💡 คำใบ้: ${hint}`)).toBeInTheDocument();
    expect(mockSpeakThai).toHaveBeenLastCalledWith(hint);
  });
});
