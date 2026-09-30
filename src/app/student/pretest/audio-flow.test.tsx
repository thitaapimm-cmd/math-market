import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import PretestPage from "./page";

const { playSpeechMock, speakThaiMock } = vi.hoisted(() => ({
  playSpeechMock: vi.fn(),
  speakThaiMock: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/storage", () => ({
  api: {
    getCurrentStudent: () => ({ id: "student-1", name: "ทดสอบ" }),
    recordAssessment: vi.fn(), recordAttempt: vi.fn(),
  },
}));
vi.mock("@/lib/speech", () => ({
  playSpeech: playSpeechMock,
  stopSpeech: vi.fn(),
  speakThai: speakThaiMock,
  playSoundEffect: vi.fn(),
}));
vi.mock("@/lib/celebration", () => ({
  celebrateCorrect: vi.fn(), celebrateCompletion: vi.fn(),
}));

beforeEach(() => {
  vi.spyOn(Math, "random").mockReturnValue(0.999);
  playSpeechMock.mockResolvedValue("ended");
});
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.restoreAllMocks(); });

it("lets a learner confirm a 15 baht answer after its question finishes", async () => {
  render(<PretestPage />);
  for (const [question, answer] of [
    ["นี่คือเงินกี่บาท?", "10 บาท"],
    ["ธนบัตรนี้มีค่ากี่บาท?", "20 บาท"],
    ["ถ้าจะซื้อไก่ทอด 10 บาท ควรเลือกเงินใด?", "10 บาท"],
  ]) {
    await screen.findByText(question);
    await waitFor(() => expect(screen.getByRole("button", { name: answer })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: answer }));
    fireEvent.click(screen.getByRole("button", { name: "ยืนยันคำตอบ" }));
  }

  await screen.findByText("ผัดมาม่า ราคา 15 บาท ต้องใช้เงินรวมกันกี่บาท?");
  await waitFor(() => expect(screen.getByRole("button", { name: "15 บาท" })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: "15 บาท" }));
  expect(screen.getByRole("button", { name: "ยืนยันคำตอบ" })).toBeEnabled();
  expect(screen.queryByText("🔊 กำลังอ่าน กรุณาฟังให้จบ")).not.toBeInTheDocument();
  expect(playSpeechMock).not.toHaveBeenCalledWith("15 บาท");
  fireEvent.click(screen.getByRole("button", { name: "ยืนยันคำตอบ" }));
  await screen.findByText("ข้อที่ 5 จาก 5");
});
