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
  "นมสดกล่อง ราคา 20 บาท หนูจะเลือกเงินใบไหน?":
    "/audio/th/l2-milk-20-question.m4a",
  "ขนมปัง ราคา 10 บาท หนูจะเลือกเงินใบไหน?":
    "/audio/th/l2-bread-10-question.m4a",
  "น้ำผลไม้ ราคา 20 บาท หนูจะเลือกเงินใบไหน?":
    "/audio/th/l2-juice-20-question.m4a",
  "สมุดบันทึก ราคา 20 บาท หนูจะเลือกเงินใบไหน?":
    "/audio/th/l2-notebook-20-question.m4a",
  "ดินสอ ราคา 10 บาท หนูจะเลือกเงินใบไหน?":
    "/audio/th/l2-pencil-10-question.m4a",
  "ขนมกล่องโต ราคา 30 บาท เลือกเงินให้พอดี":
    "/audio/th/l3-cookie-30-question.m4a",
  "สมุดระบายสี ราคา 40 บาท เลือกเงินให้พอดี":
    "/audio/th/l3-coloring-book-40-question.m4a",
  "น้ำผลไม้ปั่น ราคา 25 บาท เลือกเงินให้พอดี":
    "/audio/th/l3-juice-25-question.m4a",
  "แซนด์วิช ราคา 35 บาท เลือกเงินให้พอดี":
    "/audio/th/l3-sandwich-35-question.m4a",
  "กล่องดินสอ ราคา 50 บาท เลือกเงินให้พอดี":
    "/audio/th/l3-pencil-case-50-question.m4a",
  "นม 20 บาท กับ ขนมปัง 10 บาท รวมทั้งหมดกี่บาท?":
    "/audio/th/l4-milk-bread-question.m4a",
  "ดินสอ 10 บาท กับ สมุด 20 บาท รวมทั้งหมดกี่บาท?":
    "/audio/th/l4-pencil-book-question.m4a",
  "น้ำผลไม้ 20 บาท กับ คุกกี้ 5 บาท รวมทั้งหมดกี่บาท?":
    "/audio/th/l4-juice-cookie-question.m4a",
  "ยางลบ 5 บาท กับ ไม้บรรทัด 10 บาท รวมทั้งหมดกี่บาท?":
    "/audio/th/l4-eraser-ruler-question.m4a",
  "สีไม้ 30 บาท กับ สมุดวาดเขียน 20 บาท รวมทั้งหมดกี่บาท?":
    "/audio/th/l4-color-book-question.m4a",
  "เลือกเงินให้ครบ 15 บาท": "/audio/th/l4-pay-15-question.m4a",
  "เลือกเงินให้ครบ 25 บาท": "/audio/th/l4-pay-25-question.m4a",
  "เลือกเงินให้ครบ 30 บาท": "/audio/th/l4-pay-30-question.m4a",
  "เลือกเงินให้ครบ 50 บาท": "/audio/th/l4-pay-50-question.m4a",
  "เลือกเงินให้ครบ 10 บาทพอดีนะ": "/audio/th/hint-pay-10.m4a",
  "เลือกเงินให้ครบ 15 บาทพอดีนะ": "/audio/th/hint-pay-15.m4a",
  "เลือกเงินให้ครบ 20 บาทพอดีนะ": "/audio/th/hint-pay-20.m4a",
  "เลือกเงินให้ครบ 25 บาทพอดีนะ": "/audio/th/hint-pay-25.m4a",
  "เลือกเงินให้ครบ 30 บาทพอดีนะ": "/audio/th/hint-pay-30.m4a",
  "เลือกเงินให้ครบ 35 บาทพอดีนะ": "/audio/th/hint-pay-35.m4a",
  "เลือกเงินให้ครบ 40 บาทพอดีนะ": "/audio/th/hint-pay-40.m4a",
  "เลือกเงินให้ครบ 50 บาทพอดีนะ": "/audio/th/hint-pay-50.m4a",
  "ลองบวก 20 บาท กับ 10 บาท รวมกันอีกครั้งนะ": "/audio/th/hint-l4-sum-30.m4a",
  "ดินสอ 10 บาท บวกสมุด 20 บาท เท่ากับ 30 บาท": "/audio/th/hint-l4-pencil-book.m4a",
  "น้ำผลไม้ 20 บาท บวกคุกกี้ 5 บาท เท่ากับ 25 บาท": "/audio/th/hint-l4-juice-cookie.m4a",
  "ยางลบ 5 บาท บวกไม้บรรทัด 10 บาท เท่ากับ 15 บาท": "/audio/th/hint-l4-eraser-ruler.m4a",
  "สีไม้ 30 บาท บวกสมุด 20 บาท เท่ากับ 50 บาท": "/audio/th/hint-l4-color-book.m4a",
  "คำใบ้: โจทย์บอกให้ไปร้านค้าป้ารม": "/audio/th/hint-l5-shop-local.m4a",
  "คำใบ้: โจทย์บอกให้ไปสหกรณ์โรงเรียน": "/audio/th/hint-l5-shop-school.m4a",
  "คำใบ้: เลือกขนมปังให้ครบ": "/audio/th/hint-l5-item-bread.m4a",
  "คำใบ้: เลือกสมุดให้ครบ": "/audio/th/hint-l5-item-book.m4a",
  "คำใบ้: เลือกน้ำผลไม้ และ คุกกี้ให้ครบ": "/audio/th/hint-l5-items-juice-cookie.m4a",
  "คำใบ้: เลือกดินสอ และ ยางลบให้ครบ": "/audio/th/hint-l5-items-pencil-eraser.m4a",
  "คำใบ้: เลือกนมสด และ แซนด์วิชให้ครบ": "/audio/th/hint-l5-items-milk-sandwich.m4a",
  "ไปร้านค้าป้ารม แล้วเลือกขนมปัง ราคา 10 บาท":
    "/audio/th/l5-rom-bread-question.m4a",
  "ไปสหกรณ์โรงเรียน แล้วเลือกสมุดเขียน ราคา 20 บาท":
    "/audio/th/l5-coop-notebook-question.m4a",
  "ไปร้านค้าป้ารม แล้วเลือกน้ำส้มคั้น และ ขนมกรุบกรอบ ราคา 30 บาท":
    "/audio/th/l5-rom-juice-snack-question.m4a",
  "ไปสหกรณ์โรงเรียน แล้วเลือกดินสอดำ และ นมสดกล่อง ราคา 30 บาท":
    "/audio/th/l5-coop-pencil-milk-question.m4a",
  "หนูเลือกร้านและสินค้าที่อยากซื้อเองได้เลย":
    "/audio/th/l5-free-shopping-question.m4a",
  "เลือกสินค้าที่อยากซื้อใส่ตะกร้า":
    "/audio/th/l5-free-items-question.m4a",
  "เลือกขนมปัง ใส่ตะกร้า": "/audio/th/l5-bread-items-question.m4a",
  "เลือกสมุดเขียน ใส่ตะกร้า": "/audio/th/l5-notebook-items-question.m4a",
  "เลือกน้ำส้มคั้น และ ขนมกรุบกรอบ ใส่ตะกร้า":
    "/audio/th/l5-juice-snack-items-question.m4a",
  "เลือกดินสอดำ และ นมสดกล่อง ใส่ตะกร้า":
    "/audio/th/l5-pencil-milk-items-question.m4a",
  "ยอด 10 บาท เลือกเงินให้พอดี": "/audio/th/l5-pay-10-question.m4a",
  "ยอด 20 บาท เลือกเงินให้พอดี": "/audio/th/l5-pay-20-question.m4a",
  "ยอด 30 บาท เลือกเงินให้พอดี": "/audio/th/l5-pay-30-question.m4a",
  "ยอด 40 บาท เลือกเงินให้พอดี": "/audio/th/l5-pay-40-question.m4a",
  "ยอด 50 บาท เลือกเงินให้พอดี": "/audio/th/l5-pay-50-question.m4a",
  "ยอด 60 บาท เลือกเงินให้พอดี": "/audio/th/l5-pay-60-question.m4a",
  "เลือกเงินให้ครบ 60 บาทพอดีนะ": "/audio/th/hint-pay-60.m4a",
  "คำใบ้: เลือกสมุดเขียนให้ครบ": "/audio/th/hint-l5-item-notebook.m4a",
  "คำใบ้: เลือกน้ำส้มคั้น และ ขนมกรุบกรอบให้ครบ":
    "/audio/th/hint-l5-items-juice-snack-new.m4a",
  "คำใบ้: เลือกดินสอดำ และ นมสดกล่องให้ครบ":
    "/audio/th/hint-l5-items-pencil-milk.m4a",
  "ถูกต้อง ซื้อของสำเร็จ": "/audio/th/l5-purchase-correct.m4a",
  "ยอดเยี่ยม หนูซื้อของครบ 5 ข้อแล้ว": "/audio/th/l5-complete.m4a",
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

export const speakThaiAndWait = (
  text: string,
  fallbackMs = 5000,
): Promise<void> => {
  if (typeof window === "undefined") return Promise.resolve();

  const recording = THAI_RECORDINGS[text];
  if (!recording || typeof Audio === "undefined") {
    speakWithBrowserVoice(text);
    return Promise.resolve();
  }

  window.speechSynthesis?.cancel();
  currentVoiceAudio?.pause();

  const audio = new Audio(recording);
  currentVoiceAudio = audio;

  return new Promise((resolve) => {
    let settled = false;
    const timeout = window.setTimeout(() => settle(), fallbackMs);
    const settle = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      audio.onended = null;
      audio.onerror = null;
      if (currentVoiceAudio === audio) currentVoiceAudio = null;
      resolve();
    };

    audio.onended = settle;
    audio.onerror = () => {
      if (currentVoiceAudio === audio) currentVoiceAudio = null;
      speakWithBrowserVoice(text);
      settle();
    };
    void audio.play().catch(() => {
      if (currentVoiceAudio === audio) currentVoiceAudio = null;
      speakWithBrowserVoice(text);
      settle();
    });
  });
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
