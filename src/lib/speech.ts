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
  'ถ้าจะซื้อไก่ทอด 10 บาท ควรเลือกเงินใด?': "/audio/th/pretest-chicken-10.wav",
  'ผัดมาม่า ราคา 15 บาท ต้องใช้เงินรวมกันกี่บาท?': "/audio/th/pretest-noodles-15.wav",
  'ป๊อกกี้ 20 บาท กับ คุกกี้ 5 บาท รวมเป็นกี่บาท?': "/audio/th/pretest-pocky-cookie-25.wav",
  'ป๊อกกี้ 20 บาท บวกคุกกี้ 5 บาท รวมเป็น 25 บาท': "/audio/th/pretest-hint-pocky-cookie-25.wav",
  'ไก่ทอด ราคา 10 บาท หนูจะเลือกเงินใบไหน?': "/audio/th/l2-chicken-10.wav",
  'คุกกี้ ราคา 5 บาท หนูจะเลือกเงินใบไหน?': "/audio/th/l2-cookie-5.wav",
  'ชาไทย ราคา 10 บาท หนูจะเลือกเงินใบไหน?': "/audio/th/l2-thai-tea-10.wav",
  'โอรีโอ้ ราคา 5 บาท หนูจะเลือกเงินใบไหน?': "/audio/th/l2-oreo-5-updated.wav",
  'ป๊อกกี้ ราคา 20 บาท หนูจะเลือกเงินใบไหน?': "/audio/th/l2-pocky-20.wav",
  'โอรีโอ้ ราคา 5 บาท ให้เลือกเงิน 5 บาท': "/audio/th/l2-hint-oreo-5.wav",
  'ป๊อกกี้ ราคา 20 บาท ให้เลือกเงิน 20 บาท': "/audio/th/l2-hint-pocky-20.wav",
  'ผัดมาม่า ราคา 15 บาท เลือกเงินให้พอดี': "/audio/th/l3-noodles-15.wav",
  'เบนโตะ ราคา 5 บาท เลือกเงินให้พอดี': "/audio/th/l3-bento-5.wav",
  'เฟรนฟราย ราคา 10 บาท เลือกเงินให้พอดี': "/audio/th/l3-fries-10.wav",
  'เยลลี่ ราคา 10 บาท เลือกเงินให้พอดี': "/audio/th/l3-jelly-10.wav",
  'ไอติมโคล่า ราคา 5 บาท เลือกเงินให้พอดี': "/audio/th/l3-cola-5.wav",
  'ไก่ทอด 10 บาท กับ คุกกี้ 5 บาท รวมทั้งหมดกี่บาท?': "/audio/th/l4-chicken-cookie.wav",
  'ชาไทย 10 บาท กับ ป๊อกกี้ 20 บาท รวมทั้งหมดกี่บาท?': "/audio/th/l4-tea-pocky-30.wav",
  'ผัดมาม่า 15 บาท กับ โอรีโอ้ 5 บาท รวมทั้งหมดกี่บาท?': "/audio/th/l4-noodles-oreo-updated.wav",
  'ชาไทย 10 บาท บวก ป๊อกกี้ 20 บาท รวมเป็น 30 บาท': "/audio/th/l4-hint-tea-pocky-30.wav",
  'ผัดมาม่า 15 บาท บวก โอรีโอ้ 5 บาท รวมเป็น 20 บาท': "/audio/th/l4-hint-noodles-oreo-20.wav",
  'เบนโตะ 5 บาท กับ ไอติมโคล่า 5 บาท รวมทั้งหมดกี่บาท?': "/audio/th/l4-bento-cola.wav",
  'ชีสบอล 10 บาท กับ ไอติมเรนโบว์ 10 บาท รวมทั้งหมดกี่บาท?': "/audio/th/l4-cheese-rainbow.wav",
  'เลือกเงินให้ครบ 10 บาท': "/audio/th/l4-pay-10.wav",
  'เลือกเงินให้ครบ 20 บาท': "/audio/th/l4-pay-20.wav",
  'ไปร้านค้าป้ารม แล้วเลือกผัดมาม่า ราคา 15 บาท': "/audio/th/l5-rom-noodles.wav",
  'ไปสหกรณ์โรงเรียน แล้วเลือกโอรีโอ้ ราคา 5 บาท': "/audio/th/l5-coop-oreo-updated.wav",
  'ไปร้านค้าป้ารม แล้วเลือกไก่ทอด และ ชาไทย ราคา 20 บาท': "/audio/th/l5-rom-chicken-tea.wav",
  'ไปสหกรณ์โรงเรียน แล้วเลือกป๊อกกี้ และ คุกกี้ ราคา 25 บาท': "/audio/th/l5-coop-pocky-cookie-25.wav",
  'เลือกผัดมาม่า ใส่ตะกร้า': "/audio/th/l5-items-noodles.wav",
  'เลือกโอรีโอ้ ใส่ตะกร้า': "/audio/th/l5-items-oreo-updated.wav",
  'เลือกไก่ทอด และ ชาไทย ใส่ตะกร้า': "/audio/th/l5-items-chicken-tea.wav",
  'เลือกป๊อกกี้ และ คุกกี้ ใส่ตะกร้า': "/audio/th/l5-items-pocky-cookie-updated.wav",
  'คำใบ้: เลือกโอรีโอ้ให้ครบ': "/audio/th/l5-hint-items-oreo.wav",
  'คำใบ้: เลือกป๊อกกี้ และ คุกกี้ให้ครบ': "/audio/th/l5-hint-items-pocky-cookie.wav",
  'ยอด 5 บาท เลือกเงินให้พอดี': "/audio/th/l5-pay-5.wav",
  'ยอด 15 บาท เลือกเงินให้พอดี': "/audio/th/l5-pay-15.wav",
  'ยอด 25 บาท เลือกเงินให้พอดี': "/audio/th/l5-pay-25.wav",
  "สังเกตตัวเลข 5 บนเหรียญนะจ๊ะ": "/audio/th/l1-hint-5.wav",
  "เก่งมาก พร้อมเริ่มเรียนแล้ว!": "/audio/th/pretest-complete.wav",
  "เยี่ยมมาก! หนูรู้จักเงินแล้ว ปลดล็อกด่านที่ 2 แล้วจ้า": "/audio/th/l1-complete.wav",
  "เก่งมาก! หนูจับคู่เงินกับราคาสินค้าได้ถูกต้องแล้ว": "/audio/th/l2-complete.wav",
  "ยอดเยี่ยมมาก! หนูรวมเงินซื้อของ 1 ชิ้นสำเร็จแล้ว": "/audio/th/l3-complete.wav",
  "เก่งมาก ผ่านด่านที่ 4 แล้ว": "/audio/th/l4-complete.wav",
};

type SpeechResult = "ended" | "unavailable" | "cancelled";
let currentVoiceAudio: HTMLAudioElement | null = null;
let cancelCurrentSpeech: (() => void) | null = null;
let sharedAudioContext: AudioContext | null = null;

export const stopSpeech = () => {
  cancelCurrentSpeech?.();
  cancelCurrentSpeech = null;
};

export const playSpeech = (text: string): Promise<SpeechResult> => {
  if (typeof window === "undefined") return Promise.resolve("unavailable");
  stopSpeech();

  return new Promise((resolve) => {
    let finished = false;
    let audio: HTMLAudioElement | null = null;
    let watchdog: number | undefined;
    let monitor: number | undefined;
    const synth = window.speechSynthesis;
    const finish = (result: SpeechResult) => {
      if (finished) return;
      finished = true;
      if (watchdog !== undefined) window.clearTimeout(watchdog);
      if (monitor !== undefined) window.clearInterval(monitor);
      if (audio) {
        audio.onended = null;
        audio.onerror = null;
      }
      if (currentVoiceAudio === audio) currentVoiceAudio = null;
      if (cancelCurrentSpeech === cancel) cancelCurrentSpeech = null;
      resolve(result);
    };
    const cancel = () => {
      audio?.pause();
      synth?.cancel();
      finish("cancelled");
    };
    cancelCurrentSpeech = cancel;

    const playBrowserVoice = () => {
      if (audio) {
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        if (currentVoiceAudio === audio) currentVoiceAudio = null;
        audio = null;
      }
      if (watchdog !== undefined) window.clearTimeout(watchdog);
      if (monitor !== undefined) window.clearInterval(monitor);
      if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
        finish("unavailable");
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = synth.getVoices?.() ?? [];
      const thaiVoice = voices.find((voice) => voice.lang.toLowerCase() === "th-th") ??
        voices.find((voice) => voice.lang.toLowerCase().startsWith("th"));
      utterance.lang = "th-TH";
      utterance.rate = 0.88;
      utterance.pitch = 1.05;
      if (thaiVoice) utterance.voice = thaiVoice;
      const issuedAt = Date.now();
      let startedAt: number | null = null;
      let silentChecks = 0;
      utterance.onstart = () => { startedAt = Date.now(); };
      utterance.onend = () => finish("ended");
      utterance.onerror = () => finish("unavailable");
      try {
        synth.cancel();
        synth.resume?.();
        synth.speak(utterance);
        monitor = window.setInterval(() => {
          if (synth.speaking) {
            startedAt ??= Date.now();
            silentChecks = 0;
            return;
          }
          if (startedAt !== null) {
            silentChecks += 1;
            const minimumDuration = Math.min(12000, Math.max(1500, text.length * 95));
            if (silentChecks >= 4 && !synth.pending && Date.now() - startedAt >= minimumDuration) finish("ended");
          } else if (!synth.pending && Date.now() - issuedAt >= 3000) {
            finish("unavailable");
          }
        }, 250);
        // Some browsers leave pending/speaking true after audible speech stops.
        const maxDuration = Math.min(15000, Math.max(5000, text.length * 150));
        watchdog = window.setTimeout(() => { synth.cancel(); finish("unavailable"); }, maxDuration);
      } catch {
        finish("unavailable");
      }
    };

    const recording = THAI_RECORDINGS[text];
    if (!recording || typeof Audio === "undefined") {
      playBrowserVoice();
      return;
    }
    audio = new Audio(recording);
    currentVoiceAudio = audio;
    audio.onended = () => finish("ended");
    audio.onerror = () => { if (!finished) playBrowserVoice(); };
    let lastProgressAt = Date.now();
    let lastPlaybackTime = 0;
    monitor = window.setInterval(() => {
      if (audio?.ended) finish("ended");
      if (!audio || finished) return;
      if (typeof audio.currentTime === "number" && audio.currentTime > lastPlaybackTime + 0.01) {
        lastPlaybackTime = audio.currentTime;
        lastProgressAt = Date.now();
      }
      if (Date.now() - lastProgressAt >= 8000) finish("unavailable");
    }, 250);
    try {
      void audio.play().catch((error: unknown) => {
        if (finished) return;
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          finish("unavailable");
        } else {
          playBrowserVoice();
        }
      });
    } catch {
      playBrowserVoice();
    }
    // The progress monitor releases a blocked recording; this is a final guard
    // if intervals are throttled while the page is in the background.
    if (audio && !finished) {
      watchdog = window.setTimeout(() => {
        if (!finished) playBrowserVoice();
      }, 30000);
    }
  });
};

export const speakThai = (text: string) => {
  void playSpeech(text);
};

export const speakThaiAndWait = async (text: string): Promise<void> => {
  await playSpeech(text);
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
