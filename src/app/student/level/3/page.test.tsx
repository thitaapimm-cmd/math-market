import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Level3Page from "./page";

const { mockGetCurrentStudent, mockSpeakThai, mockPlaySoundEffect } = vi.hoisted(
  () => ({
    mockGetCurrentStudent: vi.fn(),
    mockSpeakThai: vi.fn(),
    mockPlaySoundEffect: vi.fn(),
  }),
);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/storage", () => ({
  api: {
    getCurrentStudent: mockGetCurrentStudent,
    recordAttempt: vi.fn(),
    completeLevel: vi.fn(),
  },
}));

vi.mock("@/lib/speech", () => ({
  speakThai: mockSpeakThai,
  playSoundEffect: mockPlaySoundEffect,
}));

vi.mock("@/lib/celebration", () => ({
  celebrateCorrect: vi.fn(),
  celebrateCompletion: vi.fn(),
}));

describe("Level 3 flexible payment", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Math, "random").mockReturnValue(0.999);
    mockGetCurrentStudent.mockReturnValue({ id: "student-1", name: "ทดสอบ" });
  });

  it.each([
    { clicks: [10, 10, 10], equation: "10 × 3 = 30 บาท" },
    { clicks: [20, 10], equation: "10 + 20 = 30 บาท" },
    { clicks: [10, 10, 5, 5], equation: "5 × 2 + 10 × 2 = 30 บาท" },
  ])("accepts the exact-payment combination $equation", async ({ clicks, equation }) => {
    const user = userEvent.setup();
    render(<Level3Page />);

    expect(await screen.findByText("ข้อที่ 1 จาก 5")).toBeInTheDocument();
    for (const value of clicks) {
      const kind = value <= 10 ? "เหรียญ" : "ธนบัตร";
      await user.click(screen.getByRole("button", { name: `เพิ่ม${kind} ${value} บาท` }));
    }
    expect(screen.getByText(equation)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "จ่ายเงิน" }));
    expect(mockPlaySoundEffect).toHaveBeenLastCalledWith("correct");
  });

  it("reads the question and speaks the exact visible payment hint", async () => {
    const user = userEvent.setup();
    render(<Level3Page />);

    await waitFor(() =>
      expect(mockSpeakThai).toHaveBeenCalledWith(
        "ขนมกล่องโต ราคา 30 บาท เลือกเงินให้พอดี",
      ),
    );
    await user.click(
      await screen.findByRole("button", { name: "เพิ่มเหรียญ 10 บาท" }),
    );
    await user.click(screen.getByRole("button", { name: "จ่ายเงิน" }));

    const hint = "เลือกเงินให้ครบ 30 บาทพอดีนะ";
    expect(screen.getByRole("status")).toHaveTextContent(hint);
    expect(mockSpeakThai).toHaveBeenLastCalledWith(hint);
  });
});
