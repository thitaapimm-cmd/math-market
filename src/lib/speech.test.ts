import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("Thai audio", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("uses a bundled Thai recording for a known instruction", async () => {
    const play = vi.fn().mockResolvedValue(undefined);
    const pause = vi.fn();
    const AudioMock = vi.fn(function AudioMock(this: { play: typeof play; pause: typeof pause }) {
      this.play = play;
      this.pause = pause;
    });
    vi.stubGlobal("Audio", AudioMock);

    const { speakThai } = await import("./speech");
    speakThai("เงินนี้มีค่าเท่าไร?");

    expect(AudioMock).toHaveBeenCalledWith("/audio/th/identify-money.m4a");
    expect(play).toHaveBeenCalledOnce();
  });

  it.each([
    ["ถูกต้อง เก่งมาก", "/audio/th/answer-correct.m4a"],
    ["ยังไม่ถูก ลองอีกครั้งนะ", "/audio/th/answer-wrong.m4a"],
  ])("uses a bundled Thai answer result for %s", async (text, audioPath) => {
    const play = vi.fn().mockResolvedValue(undefined);
    const AudioMock = vi.fn(function AudioMock(this: { play: typeof play; pause: () => void }) {
      this.play = play;
      this.pause = vi.fn();
    });
    vi.stubGlobal("Audio", AudioMock);

    const { speakThai } = await import("./speech");
    speakThai(text);

    expect(AudioMock).toHaveBeenCalledWith(audioPath);
    expect(play).toHaveBeenCalledOnce();
  });

  it("uses bundled Thai audio for a configured wrong-answer hint", async () => {
    const play = vi.fn().mockResolvedValue(undefined);
    const AudioMock = vi.fn(function AudioMock(this: { play: typeof play; pause: () => void }) {
      this.play = play;
      this.pause = vi.fn();
    });
    vi.stubGlobal("Audio", AudioMock);

    const { speakThai } = await import("./speech");
    speakThai("ดินสอ 10 บาท ใช้เหรียญ 10 บาท");

    expect(AudioMock).toHaveBeenCalledWith("/audio/th/hint-l2-pencil-10.m4a");
    expect(play).toHaveBeenCalledOnce();
  });

  it.each([
    ["เลือกเงินให้ครบ 30 บาทพอดีนะ", "/audio/th/hint-pay-30.m4a"],
    ["ลองบวก 20 บาท กับ 10 บาท รวมกันอีกครั้งนะ", "/audio/th/hint-l4-sum-30.m4a"],
    ["คำใบ้: โจทย์บอกให้ไปร้านค้าป้ารม", "/audio/th/hint-l5-shop-local.m4a"],
  ])("uses bundled audio for later-level hint %s", async (text, audioPath) => {
    const play = vi.fn().mockResolvedValue(undefined);
    const AudioMock = vi.fn(function AudioMock(this: { play: typeof play; pause: () => void }) {
      this.play = play;
      this.pause = vi.fn();
    });
    vi.stubGlobal("Audio", AudioMock);

    const { speakThai } = await import("./speech");
    speakThai(text);

    expect(AudioMock).toHaveBeenCalledWith(audioPath);
    expect(play).toHaveBeenCalledOnce();
  });

  it("chooses an installed th-TH voice for dynamic speech", async () => {
    const thaiVoice = { lang: "th-TH", name: "Kanya" } as SpeechSynthesisVoice;
    const englishVoice = { lang: "en-US", name: "Samantha" } as SpeechSynthesisVoice;
    const speak = vi.fn();
    const cancel = vi.fn();
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        cancel,
        getVoices: () => [englishVoice, thaiVoice],
        resume: vi.fn(),
        speak,
      },
    });

    class UtteranceMock {
      lang = "";
      rate = 1;
      pitch = 1;
      voice: SpeechSynthesisVoice | null = null;
      constructor(public text: string) {}
    }
    vi.stubGlobal("SpeechSynthesisUtterance", UtteranceMock);

    const { speakThai } = await import("./speech");
    speakThai("สวัสดี นักเรียนคนเก่ง");

    const utterance = speak.mock.calls[0][0] as UtteranceMock;
    expect(utterance.lang).toBe("th-TH");
    expect(utterance.voice).toBe(thaiVoice);
  });

  it("stops a recorded instruction before speaking dynamic Thai feedback", async () => {
    const play = vi.fn().mockResolvedValue(undefined);
    const pause = vi.fn();
    vi.stubGlobal(
      "Audio",
      vi.fn(function AudioMock(this: { play: typeof play; pause: typeof pause }) {
        this.play = play;
        this.pause = pause;
      }),
    );
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        cancel: vi.fn(),
        getVoices: () => [],
        resume: vi.fn(),
        speak: vi.fn(),
      },
    });
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      class UtteranceMock {
        lang = "";
        rate = 1;
        pitch = 1;
        constructor(public text: string) {}
      },
    );

    const { speakThai } = await import("./speech");
    speakThai("เงินนี้มีค่าเท่าไร?");
    speakThai("ถูกต้อง เก่งมาก");

    expect(pause).toHaveBeenCalledOnce();
  });

  it("reuses one audio context instead of creating and closing one per click", async () => {
    const oscillator = {
      type: "sine" as OscillatorType,
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const gain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
    const context = {
      currentTime: 0,
      destination: {},
      state: "running",
      createOscillator: () => oscillator,
      createGain: () => gain,
      resume: vi.fn().mockResolvedValue(undefined),
      close: vi.fn(),
    };
    const AudioContextMock = vi.fn(() => context);
    vi.stubGlobal("AudioContext", AudioContextMock);

    const { playSoundEffect } = await import("./speech");
    playSoundEffect("click");
    playSoundEffect("click");

    expect(AudioContextMock).toHaveBeenCalledOnce();
    expect(context.close).not.toHaveBeenCalled();
  });

  it("waits for a bundled recording to end", async () => {
    let audioInstance: { onended: (() => void) | null; onerror: (() => void) | null } | null = null;
    vi.stubGlobal(
      "Audio",
      vi.fn(function AudioMock(this: {
        play: () => Promise<void>;
        pause: () => void;
        onended: (() => void) | null;
        onerror: (() => void) | null;
      }) {
        this.play = vi.fn().mockResolvedValue(undefined);
        this.pause = vi.fn();
        this.onended = null;
        this.onerror = null;
        audioInstance = this;
      }),
    );

    const { speakThaiAndWait } = await import("./speech");
    let resolved = false;
    const speech = speakThaiAndWait("ถูกต้อง เก่งมาก", 3000).then(() => { resolved = true; });
    await Promise.resolve();
    expect(resolved).toBe(false);

    (audioInstance as { onended: (() => void) | null }).onended?.();
    await speech;
    expect(resolved).toBe(true);
  });

  it("resolves awaited speech on an audio error", async () => {
    let audioInstance: { onerror: (() => void) | null } | null = null;
    vi.stubGlobal(
      "Audio",
      vi.fn(function AudioMock(this: {
        play: () => Promise<void>;
        pause: () => void;
        onended: (() => void) | null;
        onerror: (() => void) | null;
      }) {
        this.play = vi.fn().mockResolvedValue(undefined);
        this.pause = vi.fn();
        this.onended = null;
        this.onerror = null;
        audioInstance = this;
      }),
    );

    const { speakThaiAndWait } = await import("./speech");
    const speech = speakThaiAndWait("ถูกต้อง เก่งมาก", 3000);
    (audioInstance as { onerror: (() => void) | null }).onerror?.();
    await expect(speech).resolves.toBeUndefined();
  });

  it("uses a timeout so awaited speech cannot block the lesson", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "Audio",
      vi.fn(function AudioMock(this: {
        play: () => Promise<void>;
        pause: () => void;
        onended: (() => void) | null;
        onerror: (() => void) | null;
      }) {
        this.play = vi.fn().mockResolvedValue(undefined);
        this.pause = vi.fn();
        this.onended = null;
        this.onerror = null;
      }),
    );

    const { speakThaiAndWait } = await import("./speech");
    const speech = speakThaiAndWait("ถูกต้อง เก่งมาก", 250);
    await vi.advanceTimersByTimeAsync(250);
    await expect(speech).resolves.toBeUndefined();
  });
});
