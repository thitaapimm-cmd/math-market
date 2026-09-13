"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/storage";
import { speakThai, playSoundEffect } from "@/lib/speech";
import { MoneyCard } from "@/components/common/MoneyCard";
import { HeaderNav } from "@/components/common/HeaderNav";
import { celebrateCompletion, celebrateCorrect } from "@/lib/celebration";
import { getMoneySpeech, type MoneyValue } from "@/lib/money";
import { nowMs, secondsBetween, shuffleQuestions } from "@/lib/learningSession";
import type { AttemptAnswer } from "@/types";

const QUESTIONS = [
  {
    id: "l2-1",
    item: "นมสดกล่อง",
    price: 20,
    emoji: "🥛",
    options: [10, 20, 50],
    hint: "หานม 20 บาท เท่ากับ เงิน 20 บาทนะจ๊ะ",
  },
  {
    id: "l2-2",
    item: "ขนมปัง",
    price: 10,
    emoji: "🍞",
    options: [10, 20, 50],
    hint: "ขนมปัง 10 บาท ให้หาเหรียญ 10 บาท",
  },
  {
    id: "l2-3",
    item: "น้ำผลไม้",
    price: 20,
    emoji: "🧃",
    options: [10, 20, 100],
    hint: "น้ำผลไม้ 20 บาท ใช้เงิน 20 บาทจ้า",
  },
  {
    id: "l2-4",
    item: "สมุดบันทึก",
    price: 20,
    emoji: "📓",
    options: [10, 20, 50],
    hint: "สมุด 20 บาท ตรงกับเงิน 20 บาทพอดีเลย",
  },
  {
    id: "l2-5",
    item: "ดินสอ",
    price: 10,
    emoji: "✏️",
    options: [5, 10, 20],
    hint: "ดินสอ 10 บาท ใช้เหรียญ 10 บาท",
  },
] as const;

export default function Level2Page() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<MoneyValue | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [questions, setQuestions] = useState(() => [...QUESTIONS]);
  const [questionWrongCount, setQuestionWrongCount] = useState(0);
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
  const currentPrompt = `${currentQ.item} ราคา ${currentQ.price} บาท หนูจะเลือกเงินใบไหน?`;

  useEffect(() => {
    if (!isMounted) return;
    if (!student) router.push("/");
  }, [isMounted, router, student]);

  useEffect(() => {
    if (!isMounted || !student) return;
    questionStartedAt.current = nowMs();
    speakThai(currentPrompt);
  }, [currentPrompt, isMounted, student]);

  const selectAnswer = (choice: MoneyValue) => {
    if (isChecking) return;
    playSoundEffect("click");
    setSelectedAnswer(choice);
    setFeedback(null);
  };

  const confirmAnswer = () => {
    if (selectedAnswer === null || isChecking) return;

    const choice = selectedAnswer;
    if (choice === currentQ.price) {
      const firstTryCorrect = questionWrongCount === 0;
      const nextScore = firstTryCorrect ? score + 1 : score;
      const nextAnswers: AttemptAnswer[] = [
        ...answers.current,
        {
          question_id: currentQ.id,
          prompt: currentPrompt,
          answer: choice,
          correct: true,
          first_try_correct: firstTryCorrect,
          hint_used: questionWrongCount > 0,
          wrong_count: questionWrongCount,
          duration_seconds: secondsBetween(questionStartedAt.current, nowMs()),
        },
      ];
      answers.current = nextAnswers;
      setIsChecking(true);
      playSoundEffect("correct");
      celebrateCorrect();
      setFeedback(
        `ถูกต้อง! ${currentQ.item} ราคา ${currentQ.price} บาท ใช้เงิน ${choice} บาทได้`,
      );
      speakThai("ถูกต้อง เก่งมาก");
      setScore(nextScore);
      setTimeout(() => proceedNext(nextScore, nextAnswers), 1600);
    } else {
      playSoundEffect("wrong");
      setFeedback(
        `ยังไม่ใช่นะ หนูเลือก ${getMoneySpeech(choice)} ${currentQ.item} ราคา ${currentQ.price} บาท`,
      );
      setHint(currentQ.hint);
      setQuestionWrongCount((count) => count + 1);
      speakThai(currentQ.hint);
    }
  };

  const proceedNext = (
    finalScore: number,
    finalAnswers: AttemptAnswer[],
  ) => {
    setFeedback(null);
    setHint(null);
    setSelectedAnswer(null);
    setIsChecking(false);
    setQuestionWrongCount(0);
    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      const passed = finalScore >= 4;
      if (student) {
        const completedAt = nowMs();
        api.recordAttempt({
          student_id: student.id,
          level: 2,
          activity_type: "match_price",
          mode: "learning",
          score: finalScore,
          total_questions: questions.length,
          hint_count: finalAnswers.filter((answer) => answer.hint_used).length,
          wrong_count: finalAnswers.reduce(
            (total, answer) => total + (answer.wrong_count ?? 0),
            0,
          ),
          duration_seconds: secondsBetween(sessionStartedAt.current, completedAt),
          started_at: new Date(sessionStartedAt.current).toISOString(),
          completed_at: new Date(completedAt).toISOString(),
          answers: finalAnswers,
        });
        if (passed) api.completeLevel(student.id, 2, finalScore);
      }
      if (passed) {
        celebrateCompletion();
        speakThai("เก่งมาก! หนูจับคู่เงินกับราคาสินค้าได้ถูกต้องแล้ว");
        router.push("/student/path");
      } else {
        speakThai("ลองอีกครั้งนะคนเก่ง");
        setQuestions(shuffleQuestions(QUESTIONS));
        setIndex(0);
        setScore(0);
        answers.current = [];
        sessionStartedAt.current = nowMs();
      }
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 p-6 flex flex-col items-center">
      <HeaderNav
        title="Level 2: จับคู่เงินกับราคา"
        backUrl="/student/path"
      />

      <div className="w-full max-w-xl bg-white rounded-3xl p-8 shadow-xl border-4 border-emerald-400 text-center">
        <div className="text-slate-500 font-bold mb-2">
          ข้อที่ {index + 1} จาก {questions.length}
        </div>

        <div className="p-6 bg-emerald-50 rounded-3xl border-2 border-emerald-200 mb-6">
          <div className="text-7xl mb-3">{currentQ.emoji}</div>
          <h2 className="text-3xl font-black text-slate-800 mb-1">
            {currentQ.item}
          </h2>
          <div className="text-2xl font-black text-emerald-700">
            ราคา {currentQ.price} บาท
          </div>
        </div>

        <h3 className="text-2xl font-bold text-slate-700 mb-6">
          หนูจะเลือกเงินใบไหน?
        </h3>

        {hint && (
          <div className="p-3 bg-amber-100 border-2 border-amber-400 text-amber-900 rounded-2xl mb-4 font-bold">
            💡 คำใบ้: {hint}
          </div>
        )}
        {feedback && (
          <div className="p-3 bg-emerald-100 border-2 border-emerald-500 text-emerald-900 rounded-2xl mb-4 font-black text-xl">
            {feedback}
          </div>
        )}

        <div className="flex justify-center gap-4 flex-wrap">
          {currentQ.options.map((opt) => (
            <MoneyCard
              key={opt}
              value={opt}
              selected={selectedAnswer === opt}
              speakOnClick
              onClick={() => selectAnswer(opt)}
            />
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={confirmAnswer}
            disabled={selectedAnswer === null || isChecking}
            className="rounded-2xl bg-emerald-600 px-8 py-4 text-xl font-black text-white shadow-lg transition-all hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300">
            ยืนยันคำตอบ
          </button>
        </div>
      </div>
    </div>
  );
}
