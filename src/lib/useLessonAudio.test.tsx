import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useLessonAudio } from "./useLessonAudio";

const { playSpeechMock, stopSpeechMock } = vi.hoisted(() => ({
  playSpeechMock: vi.fn(),
  stopSpeechMock: vi.fn(),
}));
vi.mock("@/lib/speech", () => ({ playSpeech: playSpeechMock, stopSpeech: stopSpeechMock }));

function Lesson() {
  const audio = useLessonAudio("อ่านโจทย์ให้จบ", "question-1", true);
  return (
    <>
      <button disabled={audio.locked}>ตอบ</button>
      <button onClick={audio.replay} disabled={audio.locked}>ฟังอีกครั้ง</button>
      {audio.audioUnavailable && <span>เล่นเสียงไม่ได้</span>}
    </>
  );
}

afterEach(() => { cleanup(); vi.clearAllMocks(); });

it("keeps answers locked until the prompt really ends", async () => {
  let finish: (result: "ended") => void = () => undefined;
  playSpeechMock.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
  render(<Lesson />);
  expect(screen.getByRole("button", { name: "ตอบ" })).toBeDisabled();
  await act(async () => { await Promise.resolve(); });
  expect(playSpeechMock).toHaveBeenCalledWith("อ่านโจทย์ให้จบ");
  expect(screen.getByRole("button", { name: "ตอบ" })).toBeDisabled();
  await act(async () => { finish("ended"); });
  expect(screen.getByRole("button", { name: "ตอบ" })).toBeEnabled();
});

it("offers replay when playback is unavailable", async () => {
  playSpeechMock.mockResolvedValue("unavailable");
  render(<Lesson />);
  await act(async () => { await Promise.resolve(); });
  expect(screen.getByText("เล่นเสียงไม่ได้")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "ฟังอีกครั้ง" })).toBeEnabled();
});
