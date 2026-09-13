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
    vi.spyOn(Math, "random").mockReturnValue(0.999);
  });

  it("reads a selected banknote and waits for confirmation before checking", async () => {
    const user = userEvent.setup();
    render(<Level2Page />);

    await user.click(
      await screen.findByRole("button", { name: "เงิน 20 บาท" }),
    );
    expect(mockCelebrateCorrect).not.toHaveBeenCalled();
    expect(mockSpeakThai).toHaveBeenCalledWith("ธนบัตร 20 บาท");

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

    const prompt = "นมสดกล่อง ราคา 20 บาท หนูจะเลือกเงินใบไหน?";
    await waitFor(() => expect(mockSpeakThai).toHaveBeenCalledWith(prompt));
    await user.click(await screen.findByRole("button", { name: "เงิน 10 บาท" }));
    await user.click(screen.getByRole("button", { name: "ยืนยันคำตอบ" }));

    const hint = "หานม 20 บาท เท่ากับ เงิน 20 บาทนะจ๊ะ";
    expect(screen.getByText(`💡 คำใบ้: ${hint}`)).toBeInTheDocument();
    expect(mockSpeakThai).toHaveBeenLastCalledWith(hint);
  });
});
