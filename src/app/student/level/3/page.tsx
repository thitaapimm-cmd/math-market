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
import { playSoundEffect, speakThai } from "@/lib/speech";
import { api } from "@/lib/storage";
import type { AttemptAnswer } from "@/types";

const QUESTIONS = [
  { id: "l3-1", item: "ขนมกล่องโต", price: 30, emoji: "🍪" },
  { id: "l3-2", item: "สมุดระบายสี", price: 40, emoji: "🎨" },
  { id: "l3-3", item: "น้ำผลไม้ปั่น", price: 25, emoji: "🍹" },
  { id: "l3-4", item: "แซนด์วิช", price: 35, emoji: "🥪" },
  { id: "l3-5", item: "กล่องดินสอ", price: 50, emoji: "✏️" },
] as const;

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
  const totalSelected = sumMoneyQuantities(quantities);

  useEffect(() => {
    if (!isMounted) return;
    if (!student) router.push("/");
  }, [isMounted, router, student]);

  useEffect(() => {
    if (!isMounted || !student) return;
    questionStartedAt.current = nowMs();
    speakThai(prompt);
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

  const finishQuestion = (nextScore: number, nextAnswers: AttemptAnswer[]) => {
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
      speakThai("ยอดเยี่ยมมาก! หนูรวมเงินซื้อของ 1 ชิ้นสำเร็จแล้ว");
      router.push("/student/path");
    } else {
      speakThai("ลองอีกครั้งนะ รอบนี้ลองจ่ายให้ถูกตั้งแต่ครั้งแรกกัน");
      restartSession();
    }
  };

  const handlePay = () => {
    if (isChecking || totalSelected === 0) return;

    if (totalSelected !== currentQ.price) {
      playSoundEffect("wrong");
      const hint = `เลือกเงินให้ครบ ${currentQ.price} บาทพอดีนะ`;
      setFeedback(hint);
      setQuestionWrongCount((count) => count + 1);
      speakThai(hint);
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
    speakThai(`ถูกต้อง! รวมได้ ${totalSelected} บาท จ่ายเงินสำเร็จ`);
    setTimeout(() => finishQuestion(nextScore, nextAnswers), 1800);
  };

  return (
    <div className="min-h-screen bg-amber-50 p-6 flex flex-col items-center">
      <HeaderNav title="Level 3: ซื้อสินค้า 1 ชิ้น" backUrl="/student/path" />

      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-xl border-4 border-amber-400 text-center">
        <div className="mb-3 font-bold text-slate-500">
          ข้อที่ {index + 1} จาก {questions.length}
        </div>
        <div className="p-4 bg-amber-100/50 rounded-2xl mb-4">
          <div className="text-6xl">{currentQ.emoji}</div>
          <h2 className="text-2xl font-black text-slate-800">{currentQ.item}</h2>
          <div className="text-3xl font-black text-amber-700">
            ราคา {currentQ.price} บาท
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl mb-5">
          <div className="text-sm font-bold text-slate-500 mb-1">เงินที่หนูเลือก:</div>
          <div className="text-2xl font-black text-slate-800">
            {formatMoneyEquation(quantities)}
          </div>
        </div>

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
            onChange={(next) => {
              setQuantities(next);
              setFeedback(null);
            }}
            disabled={isChecking}
          />
        </div>

        <button
          type="button"
          onClick={handlePay}
          disabled={totalSelected === 0 || isChecking}
          className="w-full py-5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-2xl rounded-2xl shadow-lg active:scale-95 transition-all disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          จ่ายเงิน
        </button>
      </div>
    </div>
  );
}
