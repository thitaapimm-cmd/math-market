"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HeaderNav } from "@/components/common/HeaderNav";
import { MoneyQuantitySelector } from "@/components/common/MoneyQuantitySelector";
import { celebrateCompletion, celebrateCorrect } from "@/lib/celebration";
import { nowMs, secondsBetween, shuffleQuestions } from "@/lib/learningSession";
import { expandMoneyQuantities, formatMoneyEquation, sumMoneyQuantities, type MoneyQuantities } from "@/lib/money";
import { playSoundEffect } from "@/lib/speech";
import { useLessonAudio } from "@/lib/useLessonAudio";
import { SpeechStatus } from "@/components/common/SpeechStatus";
import { api } from "@/lib/storage";
import type { AttemptAnswer } from "@/types";
import { productById } from "@/lib/catalog";
import { ProductImage } from "@/components/common/ProductImage";

const QUESTIONS = [
  ["rom_fried_chicken", "coop_cookie"],
  ["rom_thai_tea", "coop_pocky"],
  ["rom_fried_noodles", "coop_oreo"],
  ["coop_bento", "coop_cola_icecream_5"],
  ["rom_cheese_ball", "coop_rainbow_icecream"],
].map(([firstId, secondId], index) => {
  const items = [productById(firstId), productById(secondId)];
  const total = items[0].price + items[1].price;
  return {
    id: `l4-${index + 1}`, items, total,
    options: [total - 5, total, total + 5],
    sumHint: `${items[0].name} ${items[0].price} บาท บวก ${items[1].name} ${items[1].price} บาท รวมเป็น ${total} บาท`,
  };
});
const MONEY_VALUES = [5,10,20,50] as const;

export default function Level4Page() {
  const router = useRouter();
  const [questions,setQuestions]=useState(()=>[...QUESTIONS]);
  const [index,setIndex]=useState(0); const [step,setStep]=useState<1|2>(1);
  const [selectedTotal,setSelectedTotal]=useState<number|null>(null);
  const [quantities,setQuantities]=useState<MoneyQuantities>({});
  const [wrong,setWrong]=useState(0); const [score,setScore]=useState(0);
  const [feedback,setFeedback]=useState<string|null>(null); const [checking,setChecking]=useState(false);
  const [mounted,setMounted]=useState(false); const sessionStart=useRef(0); const questionStart=useRef(0);
  const answers=useRef<AttemptAnswer[]>([]);
  const student=useMemo(()=>mounted?api.getCurrentStudent():null,[mounted]);
  useEffect(()=>{queueMicrotask(()=>{setQuestions(shuffleQuestions(QUESTIONS));sessionStart.current=nowMs();setMounted(true);});},[]);
  const q=questions[index]; const total=sumMoneyQuantities(quantities);
  const prompt=step===1?`${q.items[0].name} ${q.items[0].price} บาท กับ ${q.items[1].name} ${q.items[1].price} บาท รวมทั้งหมดกี่บาท?`:`เลือกเงินให้ครบ ${q.total} บาท`;
  useEffect(()=>{if(mounted&&!student)router.push("/");},[mounted,student,router]);
  const audio = useLessonAudio(prompt, `${q.id}-${step}`, mounted && Boolean(student));
  useEffect(()=>{if(mounted&&student){questionStart.current=nowMs();}},[q,step,mounted,student]);

  const confirmTotal=()=>{if(selectedTotal===null||checking||audio.isBusy())return;if(selectedTotal!==q.total){playSoundEffect("wrong");setWrong(v=>v+1);setFeedback(q.sumHint);void audio.say(q.sumHint);return;}playSoundEffect("correct");celebrateCorrect();setChecking(true);setFeedback(`ถูกต้อง! รวม ${q.total} บาท`);void audio.say("ถูกต้อง เก่งมาก").then((result)=>{if(result === "cancelled")return;setStep(2);setChecking(false);setFeedback(null);});};
  const pay=()=>{if(total===0||checking||audio.isBusy())return;if(total!==q.total){playSoundEffect("wrong");const hint=`เลือกเงินให้ครบ ${q.total} บาทพอดีนะ`;setWrong(v=>v+1);setFeedback(hint);void audio.say(hint);return;}const first=wrong===0;const nextScore=first?score+1:score;const nextAnswers=[...answers.current,{question_id:q.id,prompt,answer:expandMoneyQuantities(quantities),correct:true,first_try_correct:first,hint_used:wrong>0,wrong_count:wrong,duration_seconds:secondsBetween(questionStart.current,nowMs()),steps:[]}];answers.current=nextAnswers;setScore(nextScore);setChecking(true);playSoundEffect("correct");celebrateCorrect();setFeedback(`ถูกต้อง! ${formatMoneyEquation(quantities)}`);void audio.say("ถูกต้อง เก่งมาก").then((result)=>{if(result !== "cancelled")advance(nextScore,nextAnswers);});};
  const advance = (nextScore: number, nextAnswers: AttemptAnswer[]) => {
    if (index + 1 < questions.length) {
      setStep(1);
      setSelectedTotal(null);
      setQuantities({});
      setWrong(0);
      setFeedback(null);
      setChecking(false);
      setIndex(index + 1);
      return;
    }
    const end = nowMs();
    if (student) {
      api.recordAttempt({
        student_id: student.id, level: 4, activity_type: "multi_item_payment",
        mode: "learning", score: nextScore, total_questions: questions.length,
        hint_count: nextAnswers.filter((answer) => answer.hint_used).length,
        wrong_count: nextAnswers.reduce((total, answer) => total + (answer.wrong_count ?? 0), 0),
        duration_seconds: secondsBetween(sessionStart.current, end),
        started_at: new Date(sessionStart.current).toISOString(),
        completed_at: new Date(end).toISOString(), answers: nextAnswers,
      });
      if (nextScore >= 4) api.completeLevel(student.id, 4, nextScore);
    }
    if (nextScore >= 4) {
      celebrateCompletion();
      void audio.say("เก่งมาก ผ่านด่านที่ 4 แล้ว").then((result) => {
        if (result !== "cancelled") router.push("/student/path");
      });
      return;
    }
    void audio.say("ลองใหม่อีกครั้งนะ").then((result) => {
      if (result === "cancelled") return;
      setStep(1);
      setSelectedTotal(null);
      setQuantities({});
      setWrong(0);
      setFeedback(null);
      setChecking(false);
      setQuestions(shuffleQuestions(QUESTIONS));
      setIndex(0);
      setScore(0);
      answers.current = [];
      sessionStart.current = nowMs();
    });
  };
  return (
    <div className="min-h-screen bg-orange-50 p-6 flex flex-col items-center">
      <HeaderNav title="Level 4: ซื้อสินค้าหลายชิ้น" backUrl="/student/path" />
      <div className="w-full max-w-6xl bg-white rounded-3xl p-5 sm:p-6 shadow-xl border-4 border-orange-400 text-center">
        <div className="mb-3 font-bold text-slate-500">ข้อที่ {index + 1} จาก {questions.length}</div>
        <SpeechStatus locked={audio.locked} unavailable={audio.audioUnavailable} onReplay={audio.replay} />
        <div className="lg:grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-8">
          <div className="grid grid-cols-2 gap-4 mb-6 lg:mb-0">
            {q.items.map((item) => (
              <div key={item.id} className="p-4 bg-orange-50 rounded-2xl border-2 border-orange-200">
                <ProductImage product={item} size={96} />
                <div className="text-xl font-bold">{item.name}</div>
                <div className="text-lg font-black text-orange-600">{item.price} บาท</div>
              </div>
            ))}
          </div>
          <div className="min-w-0">
            {feedback && <div role="status" className="p-3 mb-4 rounded-xl bg-amber-100 font-bold">{feedback}</div>}
            {step === 1 ? (
              <>
                <h3 className="text-2xl font-black mb-4">ทั้งหมดกี่บาท?</h3>
                <div className="grid grid-cols-3 gap-4">
                  {q.options.map((opt) => {
                    const selected = selectedTotal === opt;
                    return (
                      <button type="button" disabled={checking || audio.locked} aria-pressed={selected} onClick={() => setSelectedTotal(opt)} key={opt} className={`rounded-2xl border-4 py-4 text-2xl font-black transition-all ${selected ? "-translate-y-1 border-orange-700 bg-orange-600 text-white shadow-xl ring-4 ring-orange-200" : "border-orange-400 bg-orange-100 text-orange-950 hover:bg-orange-200"}`}>
                        {opt} บาท{selected && <span className="mt-1 block text-sm">✓ เลือกแล้ว</span>}
                      </button>
                    );
                  })}
                </div>
                <button type="button" disabled={selectedTotal === null || checking || audio.locked} onClick={confirmTotal} className="mt-5 w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xl disabled:bg-slate-300">ยืนยันคำตอบ</button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-black mb-3">เลือกเงินให้ครบ {q.total} บาท</h3>
                <MoneyQuantitySelector values={MONEY_VALUES} quantities={quantities} onChange={setQuantities} disabled={checking || audio.locked} showSelectedTray />
                <button type="button" disabled={total === 0 || checking || audio.locked} onClick={pay} className="mt-5 w-full py-5 bg-orange-500 text-white rounded-2xl font-black text-2xl disabled:bg-slate-300">จ่ายเงิน</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
