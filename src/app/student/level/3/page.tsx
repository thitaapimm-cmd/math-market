"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HeaderNav } from "@/components/common/HeaderNav";
import { MoneyQuantitySelector } from "@/components/common/MoneyQuantitySelector";
import { celebrateCompletion, celebrateCorrect } from "@/lib/celebration";
import { nowMs, secondsBetween, shuffleQuestions } from "@/lib/learningSession";
import {
  expandMoneyQuantities,
  formatMoneyEquation,
  sumMoneyQuantities,
  type MoneyQuantities,
} from "@/lib/money";
import { playSoundEffect } from "@/lib/speech";
import { useLessonAudio } from "@/lib/useLessonAudio";
import { SpeechStatus } from "@/components/common/SpeechStatus";
import { api } from "@/lib/storage";
import type { AttemptAnswer } from "@/types";
import { productById } from "@/lib/catalog";
import { ProductImage } from "@/components/common/ProductImage";

const QUESTIONS = [
  "rom_fried_noodles", "coop_bento", "rom_fries", "coop_jelly", "coop_cola_icecream_5",
].map((id, index) => {
  const product = productById(id);
  return { id: `l3-${index + 1}`, item: product.name, price: product.price, product };
});

const MONEY_VALUES = [5, 10, 20, 50] as const;

export default function Level3Page() {
  const router = useRouter();
  const [questions, setQuestions] = useState(() => [...QUESTIONS]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quantities, setQuantities] = useState<MoneyQuantities>({});
  const [questionWrongCount, setQuestionWrongCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const sessionStartedAt = useRef(0);
  const questionStartedAt = useRef(0);
  const answers = useRef<AttemptAnswer[]>([]);
  const student = useMemo(
    () => (isMounted ? api.getCurrentStudent() : null),
    [isMounted],
  );

  useEffect(() => {
    queueMicrotask(() => {
      setQuestions(shuffleQuestions(QUESTIONS));
      sessionStartedAt.current = nowMs();
      questionStartedAt.current = nowMs();
      setIsMounted(true);
    });
  }, []);

  const currentQ = questions[index];
  const prompt = `${currentQ.item} ราคา ${currentQ.price} บาท เลือกเงินให้พอดี`;
  const audio = useLessonAudio(prompt, currentQ.id, isMounted && Boolean(student));
  const totalSelected = sumMoneyQuantities(quantities);

  useEffect(() => {
    if (!isMounted) return;
    if (!student) router.push("/");
  }, [isMounted, router, student]);

  useEffect(() => {
    if (!isMounted || !student) return;
    questionStartedAt.current = nowMs();
  }, [currentQ, isMounted, prompt, student]);

  const restartSession = () => {
    setQuestions(shuffleQuestions(QUESTIONS));
    setIndex(0);
    setScore(0);
    setQuantities({});
    setQuestionWrongCount(0);
    setFeedback(null);
    setIsChecking(false);
    answers.current = [];
    sessionStartedAt.current = nowMs();
  };

  const finishQuestion = async (nextScore: number, nextAnswers: AttemptAnswer[]) => {
    setQuantities({});
    setQuestionWrongCount(0);
    setFeedback(null);
    setIsChecking(false);

    if (index + 1 < questions.length) {
      setIndex(index + 1);
      return;
    }

    const completedAt = nowMs();
    if (student) {
      api.recordAttempt({
        student_id: student.id,
        level: 3,
        activity_type: "single_item_payment",
        mode: "learning",
        score: nextScore,
        total_questions: questions.length,
        hint_count: nextAnswers.filter((answer) => answer.hint_used).length,
        wrong_count: nextAnswers.reduce(
          (total, answer) => total + (answer.wrong_count ?? 0),
          0,
        ),
        duration_seconds: secondsBetween(sessionStartedAt.current, completedAt),
        started_at: new Date(sessionStartedAt.current).toISOString(),
        completed_at: new Date(completedAt).toISOString(),
        answers: nextAnswers,
      });
    }

    if (nextScore >= 4) {
      if (student) api.completeLevel(student.id, 3, nextScore);
      celebrateCompletion();
      await audio.say("ยอดเยี่ยมมาก! หนูรวมเงินซื้อของ 1 ชิ้นสำเร็จแล้ว");
      router.push("/student/path");
    } else {
      await audio.say("ลองอีกครั้งนะ รอบนี้ลองจ่ายให้ถูกตั้งแต่ครั้งแรกกัน");
      restartSession();
    }
  };

  const handlePay = () => {
    if (isChecking || audio.isBusy() || totalSelected === 0) return;

    if (totalSelected !== currentQ.price) {
      playSoundEffect("wrong");
      const hint = `เลือกเงินให้ครบ ${currentQ.price} บาทพอดีนะ`;
      setFeedback(hint);
      setQuestionWrongCount((count) => count + 1);
      void audio.say(hint);
      return;
    }

    const firstTryCorrect = questionWrongCount === 0;
    const nextScore = firstTryCorrect ? score + 1 : score;
    const nextAnswers: AttemptAnswer[] = [
      ...answers.current,
      {
        question_id: currentQ.id,
        prompt,
        answer: expandMoneyQuantities(quantities),
        correct: true,
        first_try_correct: firstTryCorrect,
        hint_used: questionWrongCount > 0,
        wrong_count: questionWrongCount,
        duration_seconds: secondsBetween(questionStartedAt.current, nowMs()),
      },
    ];
    answers.current = nextAnswers;
    setScore(nextScore);
    setIsChecking(true);
    playSoundEffect("correct");
    celebrateCorrect();
    setFeedback(`ถูกต้อง! ${formatMoneyEquation(quantities)}`);
    void audio.say("ถูกต้อง เก่งมาก").then((result) => { if (result !== "cancelled") void finishQuestion(nextScore, nextAnswers); });
  };

  return (
    <div className="min-h-screen bg-amber-50 p-6 flex flex-col items-center">
      <HeaderNav title="Level 3: ซื้อสินค้า 1 ชิ้น" backUrl="/student/path" />

      <div className="w-full max-w-6xl bg-white rounded-3xl p-5 sm:p-6 shadow-xl border-4 border-amber-400 text-center">
        <div className="mb-3 font-bold text-slate-500">
          ข้อที่ {index + 1} จาก {questions.length}
        </div>
        <SpeechStatus locked={audio.locked} unavailable={audio.audioUnavailable} onReplay={audio.replay} />
        <div className="lg:grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-8">
        <div className="p-4 bg-amber-100/50 rounded-2xl mb-4 lg:mb-0">
          <ProductImage product={currentQ.product} size={112} />
          <h2 className="text-2xl font-black text-slate-800">{currentQ.item}</h2>
          <div className="text-3xl font-black text-amber-700">
            ราคา {currentQ.price} บาท
          </div>
        </div>

        <div className="min-w-0">
        {feedback && (
          <div role="status" className="p-3 bg-amber-100 border-2 border-amber-500 text-amber-900 rounded-2xl mb-4 font-bold text-lg">
            {feedback}
          </div>
        )}

        <div className="mb-5">
          <div className="text-slate-600 font-bold mb-3">แตะเงินซ้ำเพื่อเพิ่มจำนวน:</div>
          <MoneyQuantitySelector
            values={MONEY_VALUES}
            quantities={quantities}
            showSelectedTray
            onChange={(next) => {
              setQuantities(next);
              setFeedback(null);
            }}
            disabled={isChecking || audio.locked}
          />
        </div>

        <button
          type="button"
          onClick={handlePay}
          disabled={totalSelected === 0 || isChecking || audio.locked}
          className="w-full py-5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-2xl rounded-2xl shadow-lg active:scale-95 transition-all disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          จ่ายเงิน
        </button>
        </div>
        </div>
      </div>
    </div>
  );
}
