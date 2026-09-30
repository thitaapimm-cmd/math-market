import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Level1Page from "./page";

const { mockPlaySoundEffect, mockSpeakThai, mockCelebrateCorrect, mockRouterPush } = vi.hoisted(
  () => ({
    mockPlaySoundEffect: vi.fn(),
    mockSpeakThai: vi.fn(),
    mockCelebrateCorrect: vi.fn(),
    mockRouterPush: vi.fn(),
  }),
);

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockRouterPush }) }));
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

describe("Level 1 answer confirmation", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });
  beforeEach(() => {
    vi.clearAllMocks();
    promptMarker.current = "";
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

  it("uses five distinct denominations and returns to the path after question five", async () => {
    const user = userEvent.setup();
    render(<Level1Page />);

    for (const [position, value] of [10, 20, 50, 100, 5].entries()) {
      await screen.findByRole("button", { name: `เงิน ${value} บาท` });
      expect(screen.getByText(`ข้อที่ ${position + 1} จาก 5`)).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: `${value} บาท` }));
      await user.click(screen.getByRole("button", { name: "ยืนยันคำตอบ" }));
      if (position < 4) {
        await screen.findByText(`ข้อที่ ${position + 2} จาก 5`);
      }
    }

    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith("/student/path"));
    expect(mockSpeakThai).toHaveBeenCalledWith("เยี่ยมมาก! หนูรู้จักเงินแล้ว ปลดล็อกด่านที่ 2 แล้วจ้า");
  });
});
