import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";

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
    ["นมสดกล่อง ราคา 20 บาท หนูจะเลือกเงินใบไหน?", "/audio/th/l2-milk-20-question.m4a"],
    ["ขนมปัง ราคา 10 บาท หนูจะเลือกเงินใบไหน?", "/audio/th/l2-bread-10-question.m4a"],
    ["น้ำผลไม้ ราคา 20 บาท หนูจะเลือกเงินใบไหน?", "/audio/th/l2-juice-20-question.m4a"],
    ["สมุดบันทึก ราคา 20 บาท หนูจะเลือกเงินใบไหน?", "/audio/th/l2-notebook-20-question.m4a"],
    ["ดินสอ ราคา 10 บาท หนูจะเลือกเงินใบไหน?", "/audio/th/l2-pencil-10-question.m4a"],
    ["ขนมกล่องโต ราคา 30 บาท เลือกเงินให้พอดี", "/audio/th/l3-cookie-30-question.m4a"],
    ["สมุดระบายสี ราคา 40 บาท เลือกเงินให้พอดี", "/audio/th/l3-coloring-book-40-question.m4a"],
    ["น้ำผลไม้ปั่น ราคา 25 บาท เลือกเงินให้พอดี", "/audio/th/l3-juice-25-question.m4a"],
    ["แซนด์วิช ราคา 35 บาท เลือกเงินให้พอดี", "/audio/th/l3-sandwich-35-question.m4a"],
    ["กล่องดินสอ ราคา 50 บาท เลือกเงินให้พอดี", "/audio/th/l3-pencil-case-50-question.m4a"],
    ["นม 20 บาท กับ ขนมปัง 10 บาท รวมทั้งหมดกี่บาท?", "/audio/th/l4-milk-bread-question.m4a"],
    ["ดินสอ 10 บาท กับ สมุด 20 บาท รวมทั้งหมดกี่บาท?", "/audio/th/l4-pencil-book-question.m4a"],
    ["น้ำผลไม้ 20 บาท กับ คุกกี้ 5 บาท รวมทั้งหมดกี่บาท?", "/audio/th/l4-juice-cookie-question.m4a"],
    ["ยางลบ 5 บาท กับ ไม้บรรทัด 10 บาท รวมทั้งหมดกี่บาท?", "/audio/th/l4-eraser-ruler-question.m4a"],
    ["สีไม้ 30 บาท กับ สมุดวาดเขียน 20 บาท รวมทั้งหมดกี่บาท?", "/audio/th/l4-color-book-question.m4a"],
    ["เลือกเงินให้ครบ 15 บาท", "/audio/th/l4-pay-15-question.m4a"],
    ["เลือกเงินให้ครบ 25 บาท", "/audio/th/l4-pay-25-question.m4a"],
    ["เลือกเงินให้ครบ 30 บาท", "/audio/th/l4-pay-30-question.m4a"],
    ["เลือกเงินให้ครบ 50 บาท", "/audio/th/l4-pay-50-question.m4a"],
    ["ไปร้านค้าป้ารม แล้วเลือกขนมปัง ราคา 10 บาท", "/audio/th/l5-rom-bread-question.m4a"],
    ["ไปสหกรณ์โรงเรียน แล้วเลือกสมุดเขียน ราคา 20 บาท", "/audio/th/l5-coop-notebook-question.m4a"],
    ["ไปร้านค้าป้ารม แล้วเลือกน้ำส้มคั้น และ ขนมกรุบกรอบ ราคา 30 บาท", "/audio/th/l5-rom-juice-snack-question.m4a"],
    ["ไปสหกรณ์โรงเรียน แล้วเลือกดินสอดำ และ นมสดกล่อง ราคา 30 บาท", "/audio/th/l5-coop-pencil-milk-question.m4a"],
    ["หนูเลือกร้านและสินค้าที่อยากซื้อเองได้เลย", "/audio/th/l5-free-shopping-question.m4a"],
    ["เลือกสินค้าที่อยากซื้อใส่ตะกร้า", "/audio/th/l5-free-items-question.m4a"],
    ["เลือกขนมปัง ใส่ตะกร้า", "/audio/th/l5-bread-items-question.m4a"],
    ["เลือกสมุดเขียน ใส่ตะกร้า", "/audio/th/l5-notebook-items-question.m4a"],
    ["เลือกน้ำส้มคั้น และ ขนมกรุบกรอบ ใส่ตะกร้า", "/audio/th/l5-juice-snack-items-question.m4a"],
    ["เลือกดินสอดำ และ นมสดกล่อง ใส่ตะกร้า", "/audio/th/l5-pencil-milk-items-question.m4a"],
    ["ยอด 10 บาท เลือกเงินให้พอดี", "/audio/th/l5-pay-10-question.m4a"],
    ["ยอด 20 บาท เลือกเงินให้พอดี", "/audio/th/l5-pay-20-question.m4a"],
    ["ยอด 30 บาท เลือกเงินให้พอดี", "/audio/th/l5-pay-30-question.m4a"],
    ["ยอด 40 บาท เลือกเงินให้พอดี", "/audio/th/l5-pay-40-question.m4a"],
    ["ยอด 50 บาท เลือกเงินให้พอดี", "/audio/th/l5-pay-50-question.m4a"],
    ["ยอด 60 บาท เลือกเงินให้พอดี", "/audio/th/l5-pay-60-question.m4a"],
    ["เลือกเงินให้ครบ 60 บาทพอดีนะ", "/audio/th/hint-pay-60.m4a"],
    ["คำใบ้: เลือกสมุดเขียนให้ครบ", "/audio/th/hint-l5-item-notebook.m4a"],
    ["คำใบ้: เลือกน้ำส้มคั้น และ ขนมกรุบกรอบให้ครบ", "/audio/th/hint-l5-items-juice-snack-new.m4a"],
    ["คำใบ้: เลือกดินสอดำ และ นมสดกล่องให้ครบ", "/audio/th/hint-l5-items-pencil-milk.m4a"],
    ["ถูกต้อง ซื้อของสำเร็จ", "/audio/th/l5-purchase-correct.m4a"],
    ["ยอดเยี่ยม หนูซื้อของครบ 5 ข้อแล้ว", "/audio/th/l5-complete.m4a"],
  ])("uses bundled audio for lesson prompt %s", async (text, audioPath) => {
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

  it.each([
    ["ไก่ทอด ราคา 10 บาท หนูจะเลือกเงินใบไหน?", "/audio/th/l2-chicken-10.wav"],
    ["ผัดมาม่า ราคา 15 บาท เลือกเงินให้พอดี", "/audio/th/l3-noodles-15.wav"],
    ["ไก่ทอด 10 บาท กับ คุกกี้ 5 บาท รวมทั้งหมดกี่บาท?", "/audio/th/l4-chicken-cookie.wav"],
    ["ไปร้านค้าป้ารม แล้วเลือกผัดมาม่า ราคา 15 บาท", "/audio/th/l5-rom-noodles.wav"],
  ])("uses a recorded question for new product text %s", async (spoken, path) => {
    const play = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("Audio", vi.fn(function AudioMock() {
      return { play, pause: vi.fn(), onended: null, onerror: null };
    }));
    const { speakThai } = await import("./speech");
    speakThai(spoken);
    expect(Audio).toHaveBeenCalledWith(path);
  });

  it.each([
    ["ป๊อกกี้ 20 บาท กับ คุกกี้ 5 บาท รวมเป็นกี่บาท?", "/audio/th/pretest-pocky-cookie-25.wav"],
    ["ป๊อกกี้ 20 บาท บวกคุกกี้ 5 บาท รวมเป็น 25 บาท", "/audio/th/pretest-hint-pocky-cookie-25.wav"],
    ["โอรีโอ้ ราคา 5 บาท หนูจะเลือกเงินใบไหน?", "/audio/th/l2-oreo-5-updated.wav"],
    ["ป๊อกกี้ ราคา 20 บาท หนูจะเลือกเงินใบไหน?", "/audio/th/l2-pocky-20.wav"],
    ["โอรีโอ้ ราคา 5 บาท ให้เลือกเงิน 5 บาท", "/audio/th/l2-hint-oreo-5.wav"],
    ["ป๊อกกี้ ราคา 20 บาท ให้เลือกเงิน 20 บาท", "/audio/th/l2-hint-pocky-20.wav"],
    ["ชาไทย 10 บาท กับ ป๊อกกี้ 20 บาท รวมทั้งหมดกี่บาท?", "/audio/th/l4-tea-pocky-30.wav"],
    ["ผัดมาม่า 15 บาท กับ โอรีโอ้ 5 บาท รวมทั้งหมดกี่บาท?", "/audio/th/l4-noodles-oreo-updated.wav"],
    ["ชาไทย 10 บาท บวก ป๊อกกี้ 20 บาท รวมเป็น 30 บาท", "/audio/th/l4-hint-tea-pocky-30.wav"],
    ["ผัดมาม่า 15 บาท บวก โอรีโอ้ 5 บาท รวมเป็น 20 บาท", "/audio/th/l4-hint-noodles-oreo-20.wav"],
    ["ไปสหกรณ์โรงเรียน แล้วเลือกโอรีโอ้ ราคา 5 บาท", "/audio/th/l5-coop-oreo-updated.wav"],
    ["ไปสหกรณ์โรงเรียน แล้วเลือกป๊อกกี้ และ คุกกี้ ราคา 25 บาท", "/audio/th/l5-coop-pocky-cookie-25.wav"],
    ["เลือกโอรีโอ้ ใส่ตะกร้า", "/audio/th/l5-items-oreo-updated.wav"],
    ["เลือกป๊อกกี้ และ คุกกี้ ใส่ตะกร้า", "/audio/th/l5-items-pocky-cookie-updated.wav"],
    ["คำใบ้: เลือกโอรีโอ้ให้ครบ", "/audio/th/l5-hint-items-oreo.wav"],
    ["คำใบ้: เลือกป๊อกกี้ และ คุกกี้ให้ครบ", "/audio/th/l5-hint-items-pocky-cookie.wav"],
    ["ยอด 25 บาท เลือกเงินให้พอดี", "/audio/th/l5-pay-25.wav"],
  ])("uses the updated recording for %s", async (spoken, path) => {
    vi.stubGlobal("Audio", vi.fn(function AudioMock() {
      return { play: vi.fn().mockResolvedValue(undefined), pause: vi.fn(), onended: null, onerror: null };
    }));
    const { speakThai } = await import("./speech");
    speakThai(spoken);
    expect(Audio).toHaveBeenCalledWith(path);
    expect(existsSync(join(process.cwd(), "public", path))).toBe(true);
  });

  it.each([
    ["เก่งมาก พร้อมเริ่มเรียนแล้ว!", "/audio/th/pretest-complete.wav"],
    ["เยี่ยมมาก! หนูรู้จักเงินแล้ว ปลดล็อกด่านที่ 2 แล้วจ้า", "/audio/th/l1-complete.wav"],
    ["เก่งมาก! หนูจับคู่เงินกับราคาสินค้าได้ถูกต้องแล้ว", "/audio/th/l2-complete.wav"],
    ["ยอดเยี่ยมมาก! หนูรวมเงินซื้อของ 1 ชิ้นสำเร็จแล้ว", "/audio/th/l3-complete.wav"],
    ["เก่งมาก ผ่านด่านที่ 4 แล้ว", "/audio/th/l4-complete.wav"],
  ])("uses recorded completion speech for %s", async (spoken, path) => {
    vi.stubGlobal("Audio", vi.fn(function AudioMock() {
      return { play: vi.fn().mockResolvedValue(undefined), pause: vi.fn(), onended: null, onerror: null };
    }));
    const { speakThai } = await import("./speech");
    speakThai(spoken);
    expect(Audio).toHaveBeenCalledWith(path);
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
      vi.fn(function AudioMock() {
        const instance = {
          play: vi.fn().mockResolvedValue(undefined),
          pause: vi.fn(),
          onended: null as (() => void) | null,
          onerror: null as (() => void) | null,
        };
        audioInstance = instance;
        return instance;
      }),
    );

    const { speakThaiAndWait } = await import("./speech");
    let resolved = false;
    const speech = speakThaiAndWait("ถูกต้อง เก่งมาก").then(() => { resolved = true; });
    await Promise.resolve();
    expect(resolved).toBe(false);

    (audioInstance as unknown as { onended: (() => void) | null }).onended?.();
    await speech;
    expect(resolved).toBe(true);
  });

  it("resolves awaited speech on an audio error", async () => {
    let audioInstance: { onerror: (() => void) | null } | null = null;
    vi.stubGlobal(
      "Audio",
      vi.fn(function AudioMock() {
        const instance = {
          play: vi.fn().mockResolvedValue(undefined),
          pause: vi.fn(),
          onended: null as (() => void) | null,
          onerror: null as (() => void) | null,
        };
        audioInstance = instance;
        return instance;
      }),
    );

    const { speakThaiAndWait } = await import("./speech");
    const speech = speakThaiAndWait("ถูกต้อง เก่งมาก");
    (audioInstance as unknown as { onerror: (() => void) | null }).onerror?.();
    await expect(speech).resolves.toBeUndefined();
  });

  it("unlocks if a recording never progresses", async () => {
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

    const { playSpeech } = await import("./speech");
    const speech = playSpeech("ถูกต้อง เก่งมาก");
    await vi.advanceTimersByTimeAsync(8000);
    await expect(speech).resolves.toBe("unavailable");
  });

  it("unlocks if browser speech remains pending indefinitely", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("SpeechSynthesisUtterance", class {
      lang = "";
      rate = 1;
      pitch = 1;
      constructor(public text: string) {}
    });
    vi.stubGlobal("speechSynthesis", {
      cancel: vi.fn(), resume: vi.fn(), getVoices: () => [], speak: vi.fn(),
      pending: true, speaking: false,
    });
    const { playSpeech } = await import("./speech");
    const speech = playSpeech("ข้อความไม่มีไฟล์เสียง");
    await vi.advanceTimersByTimeAsync(5000);
    await expect(speech).resolves.toBe("unavailable");
  });

  it("waits for browser speech to finish for a new product question", async () => {
    let utterance: { onend?: () => void; onerror?: () => void } | undefined;
    vi.stubGlobal("SpeechSynthesisUtterance", class {
      onend?: () => void;
      onerror?: () => void;
      lang = "";
      rate = 1;
      pitch = 1;
      constructor(public text: string) {
        utterance = { onend: () => this.onend?.(), onerror: () => this.onerror?.() };
      }
    });
    vi.stubGlobal("speechSynthesis", {
      cancel: vi.fn(), resume: vi.fn(), getVoices: () => [], speak: vi.fn(),
    });

    const { playSpeech } = await import("./speech");
    let result = "pending";
    const playback = playSpeech("ผัดมาม่า ราคา 15 บาท").then((value) => { result = value; });
    await Promise.resolve();
    expect(result).toBe("pending");
    utterance?.onend?.();
    await playback;
    expect(result).toBe("ended");
  });

  it("does not cut a long recording off after five seconds", async () => {
    vi.useFakeTimers();
    let end: (() => void) | null = null;
    vi.stubGlobal("Audio", vi.fn(function AudioMock() {
      return {
        play: vi.fn().mockResolvedValue(undefined), pause: vi.fn(),
        get onended() { return end; },
        set onended(callback: (() => void) | null) { end = callback; },
        onerror: null,
      };
    }));
    const { playSpeech } = await import("./speech");
    let result = "pending";
    const playback = playSpeech("ถูกต้อง เก่งมาก").then((value) => { result = value; });
    await vi.advanceTimersByTimeAsync(6000);
    expect(result).toBe("pending");
    (end as (() => void) | null)?.();
    await playback;
    expect(result).toBe("ended");
  });

  it("cancels a previous question when another starts", async () => {
    vi.stubGlobal("SpeechSynthesisUtterance", class {
      onend?: () => void;
      onerror?: () => void;
      lang = "";
      rate = 1;
      pitch = 1;
      constructor(public text: string) {}
    });
    vi.stubGlobal("speechSynthesis", {
      cancel: vi.fn(), resume: vi.fn(), getVoices: () => [], speak: vi.fn(),
    });
    const { playSpeech } = await import("./speech");
    const first = playSpeech("ข้อแรก");
    void playSpeech("ข้อถัดไป");
    await expect(first).resolves.toBe("cancelled");
  });
});
