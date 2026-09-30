import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Level4Page from "./page";

const { mockSpeakThai, mockPlaySoundEffect } = vi.hoisted(() => ({
  mockSpeakThai: vi.fn(),
  mockPlaySoundEffect: vi.fn(),
}));

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
  celebrateCorrect: vi.fn(),
  celebrateCompletion: vi.fn(),
}));

describe("Level 4 two-step exercises", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    promptMarker.current = "";
    vi.spyOn(Math, "random").mockReturnValue(0.999);
  });

  it("shows five questions and reads the exact total hint after confirmation", async () => {
    const user = userEvent.setup();
    render(<Level4Page />);

    expect(await screen.findByText("ข้อที่ 1 จาก 5")).toBeInTheDocument();
    await waitFor(() =>
      expect(mockSpeakThai).toHaveBeenCalledWith(
        "ไก่ทอด 10 บาท กับ คุกกี้ 5 บาท รวมทั้งหมดกี่บาท?",
      ),
    );
    await user.click(screen.getByRole("button", { name: "20 บาท" }));
    expect(mockPlaySoundEffect).not.toHaveBeenCalledWith("wrong");
    await user.click(screen.getByRole("button", { name: "ยืนยันคำตอบ" }));

    const hint = "ไก่ทอด 10 บาท บวก คุกกี้ 5 บาท รวมเป็น 15 บาท";
    expect(screen.getByRole("status")).toHaveTextContent(hint);
    expect(mockSpeakThai).toHaveBeenLastCalledWith(hint);
  });

  it("makes the selected total visually and semantically obvious", async () => {
    const user = userEvent.setup();
    render(<Level4Page />);

    const choice = await screen.findByRole("button", { name: "20 บาท" });
    expect(choice).toHaveAttribute("aria-pressed", "false");

    await user.click(choice);

    expect(choice).toHaveAttribute("aria-pressed", "true");
    expect(choice).toHaveTextContent("เลือกแล้ว");
    expect(choice).toHaveClass("bg-orange-600", "text-white", "ring-4");
  });

  it("shows selected payment as individual money in the grouped tray", async () => {
    const user = userEvent.setup();
    render(<Level4Page />);

    await user.click(await screen.findByRole("button", { name: "15 บาท" }));
    await user.click(screen.getByRole("button", { name: "ยืนยันคำตอบ" }));
    await new Promise((resolve) => setTimeout(resolve, 1300));
    await user.click(screen.getByRole("button", { name: "เพิ่มเหรียญ 5 บาท" }));
    await user.click(screen.getByRole("button", { name: "เพิ่มเหรียญ 10 บาท" }));

    expect(screen.getByText("5 + 10 = 15 บาท")).toBeInTheDocument();
  });
});
