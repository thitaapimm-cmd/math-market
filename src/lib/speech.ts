const THAI_RECORDINGS: Readonly<Record<string, string>> = {
  "เหรียญ 1 บาท": "/audio/th/money-1.m4a",
  "เหรียญ 2 บาท": "/audio/th/money-2.m4a",
  "เหรียญ 5 บาท": "/audio/th/money-5.m4a",
  "เหรียญ 10 บาท": "/audio/th/money-10.m4a",
  "ธนบัตร 20 บาท": "/audio/th/money-20.m4a",
  "ธนบัตร 50 บาท": "/audio/th/money-50.m4a",
  "ธนบัตร 100 บาท": "/audio/th/money-100.m4a",
  "ถูกต้อง เก่งมาก": "/audio/th/answer-correct.m4a",
  "ยังไม่ถูก ลองอีกครั้งนะ": "/audio/th/answer-wrong.m4a",
  "เงินนี้มีค่าเท่าไร?": "/audio/th/identify-money.m4a",
  "นี่คือเงินกี่บาท?": "/audio/th/pretest-identify-coin.m4a",
  "ธนบัตรนี้มีค่ากี่บาท?": "/audio/th/pretest-identify-note.m4a",
  "ถ้าจะซื้อนม 20 บาท ควรเลือกเงินใบไหน?":
    "/audio/th/pretest-match-money.m4a",
  "ขนมราคา 30 บาท ต้องใช้เงินรวมกันกี่บาท?":
    "/audio/th/pretest-sum-price.m4a",
  "นม 20 บาท กับ ขนม 10 บาท รวมเป็นกี่บาท?":
    "/audio/th/pretest-sum-items.m4a",
  "หนูจะเลือกเงินใบไหน?": "/audio/th/match-price.m4a",
  "เลือกเงินให้ครบตามราคานะจ๊ะ": "/audio/th/select-exact-money.m4a",
  "รวมราคาสินค้าแล้วจ่ายเงิน": "/audio/th/sum-and-pay.m4a",
  "เลือกร้านค้า และสินค้าที่ต้องการซื้อ": "/audio/th/choose-shop.m4a",
  "สังเกตตัวเลข 10 บนเหรียญนะจ๊ะ": "/audio/th/hint-money-10.m4a",
  "ธนบัตรสีเขียวมีเลข 20 อยู่ตรงมุม": "/audio/th/hint-pretest-note-20.m4a",
  "ราคาสินค้า 20 บาท ให้เลือกเงินที่มีค่า 20 บาท": "/audio/th/hint-pretest-match-20.m4a",
  "ลองรวม 20 บาท กับ 10 บาท จะได้ 30 บาท": "/audio/th/hint-pretest-sum-30.m4a",
  "นม 20 บาท บวกขนม 10 บาท รวมเป็น 30 บาท": "/audio/th/hint-pretest-items-30.m4a",
  "ธนบัตรสีเขียว มีเลข 20 อยู่ตรงมุม": "/audio/th/hint-l1-note-20.m4a",
  "ธนบัตรสีฟ้า มีเลข 50 ชัดเจนเลยนะ": "/audio/th/hint-l1-note-50.m4a",
  "ธนบัตรสีแดง มีเลข 100 อยู่จ้า": "/audio/th/hint-l1-note-100.m4a",
  "สีเขียวใบนี้คือเงิน 20 บาท": "/audio/th/hint-l1-green-20.m4a",
  "หานม 20 บาท เท่ากับ เงิน 20 บาทนะจ๊ะ": "/audio/th/hint-l2-milk-20.m4a",
  "ขนมปัง 10 บาท ให้หาเหรียญ 10 บาท": "/audio/th/hint-l2-bread-10.m4a",
  "น้ำผลไม้ 20 บาท ใช้เงิน 20 บาทจ้า": "/audio/th/hint-l2-juice-20.m4a",
  "สมุด 20 บาท ตรงกับเงิน 20 บาทพอดีเลย": "/audio/th/hint-l2-book-20.m4a",
  "ดินสอ 10 บาท ใช้เหรียญ 10 บาท": "/audio/th/hint-l2-pencil-10.m4a",
};

let currentVoiceAudio: HTMLAudioElement | null = null;
let sharedAudioContext: AudioContext | null = null;

const speakWithBrowserVoice = (text: string) => {
  currentVoiceAudio?.pause();
  currentVoiceAudio = null;

  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    typeof SpeechSynthesisUtterance === "undefined"
  ) {
    return;
  }

  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = synth.getVoices?.() ?? [];
  const thaiVoice =
    voices.find((voice) => voice.lang.toLowerCase() === "th-th") ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("th"));

  utterance.lang = "th-TH";
  utterance.rate = 0.88;
  utterance.pitch = 1.05;
  if (thaiVoice) utterance.voice = thaiVoice;

  synth.cancel();
  synth.resume?.();
  synth.speak(utterance);
};

export const speakThai = (text: string) => {
  if (typeof window === "undefined") return;

  const recording = THAI_RECORDINGS[text];
  if (recording && typeof Audio !== "undefined") {
    window.speechSynthesis?.cancel();
    currentVoiceAudio?.pause();

    const audio = new Audio(recording);
    currentVoiceAudio = audio;
    void audio.play().catch(() => {
      if (currentVoiceAudio === audio) speakWithBrowserVoice(text);
    });
    return;
  }

  speakWithBrowserVoice(text);
};

type FeedbackSound = "correct" | "wrong" | "click" | "celebrate";

const addTone = (
  context: AudioContext,
  frequency: number,
  startOffset: number,
  duration: number,
  type: OscillatorType,
  volume: number,
) => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + startOffset;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration);
};

const getAudioContext = () => {
  if (sharedAudioContext && sharedAudioContext.state !== "closed") {
    return sharedAudioContext;
  }

  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) return null;

  sharedAudioContext = new AudioContextClass();
  return sharedAudioContext;
};

export const playSoundEffect = (type: FeedbackSound) => {
  if (typeof window === "undefined") return;
  const context = getAudioContext();
  if (!context) return;

  const play = () => {
    if (type === "click") {
      addTone(context, 600, 0, 0.05, "sine", 0.12);
    } else if (type === "wrong") {
      addTone(context, 392, 0, 0.2, "sine", 0.16);
      addTone(context, 349.23, 0.15, 0.25, "sine", 0.16);
    } else {
      addTone(context, 523.25, 0, 0.15, "triangle", 0.22);
      addTone(context, 659.25, 0.12, 0.15, "triangle", 0.22);
      addTone(context, 783.99, 0.24, 0.25, "triangle", 0.26);
      if (type === "celebrate") {
        addTone(context, 1046.5, 0.42, 0.28, "triangle", 0.24);
      }
    }
  };

  if (context.state === "suspended") {
    void context.resume().then(play).catch(() => undefined);
  } else {
    play();
  }
};
