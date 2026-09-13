"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/storage";
import { speakThai, speakThaiAndWait, playSoundEffect } from "@/lib/speech";
import { MoneyCard } from "@/components/common/MoneyCard";
import { HeaderNav } from "@/components/common/HeaderNav";
import { celebrateCompletion, celebrateCorrect } from "@/lib/celebration";
import { getMoneySpeech, type MoneyValue } from "@/lib/money";
import { nowMs, secondsBetween, shuffleQuestions } from "@/lib/learningSession";
import type { AttemptAnswer } from "@/types";

const QUESTIONS = [
  {
    id: "q1",
    type: "identify",
    money: 10,
    question: "นี่คือเงินกี่บาท?",
    options: [5, 10, 20],
    correct: 10,
    hint: "สังเกตตัวเลข 10 บนเหรียญนะจ๊ะ",
  },
  {
    id: "q2",
    type: "identify",
    money: 20,
    question: "ธนบัตรนี้มีค่ากี่บาท?",
    options: [20, 50, 100],
    correct: 20,
    hint: "ธนบัตรสีเขียวมีเลข 20 อยู่ตรงมุม",
  },
  {
    id: "q3",
    type: "match",
    item: "นมสดกล่อง",
    price: 20,
    question: "ถ้าจะซื้อนม 20 บาท ควรเลือกเงินใบไหน?",
    options: [10, 20, 50],
    correct: 20,
    hint: "ราคาสินค้า 20 บาท ให้เลือกเงินที่มีค่า 20 บาท",
  },
  {
    id: "q4",
    type: "sum",
    item: "ขนมปังเนย",
    price: 30,
    question: "ขนมราคา 30 บาท ต้องใช้เงินรวมกันกี่บาท?",
    options: [20, 30, 40],
    correct: 30,
    hint: "ลองรวม 20 บาท กับ 10 บาท จะได้ 30 บาท",
  },
  {
    id: "q5",
    type: "sum",
    item: "นม (20) + ขนม (10)",
    price: 30,
    question: "นม 20 บาท กับ ขนม 10 บาท รวมเป็นกี่บาท?",
    options: [20, 30, 50],
    correct: 30,
    hint: "นม 20 บาท บวกขนม 10 บาท รวมเป็น 30 บาท",
  },
] as const;

export default function PretestPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [questions, setQuestions] = useState(() => [...QUESTIONS]);
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

  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (!isMounted) return;
    if (!student) {
      router.push("/");
    }
  }, [isMounted, router, student]);

  useEffect(() => {
    if (!isMounted || !student) return;
    questionStartedAt.current = nowMs();
    speakThai(currentQ.question);
  }, [currentQ, isMounted, student]);

  const selectAnswer = (choice: number) => {
    if (isChecking) return;
    playSoundEffect("click");
    setSelectedAnswer(choice);
    setFeedback(null);
    if ([1, 2, 5, 10, 20, 50, 100].includes(choice)) {
      speakThai(getMoneySpeech(choice as MoneyValue));
    } else {
      speakThai(`${choice} บาท`);
    }
  };

  const confirmAnswer = async () => {
    if (selectedAnswer === null || isChecking) return;

    const q = currentQ;
    const isCorrect = selectedAnswer === q.correct;
    const nextScore = isCorrect ? score + 1 : score;
    const now = nowMs();
    const nextAnswers: AttemptAnswer[] = [
      ...answers.current,
      {
        question_id: q.id,
        prompt: q.question,
        answer: selectedAnswer,
        correct: isCorrect,
        first_try_correct: isCorrect,
        hint_used: !isCorrect,
        wrong_count: isCorrect ? 0 : 1,
        duration_seconds: secondsBetween(questionStartedAt.current, now),
      },
    ];
    answers.current = nextAnswers;
    setScore(nextScore);
    setIsChecking(true);
    playSoundEffect(isCorrect ? "correct" : "wrong");
    if (isCorrect) celebrateCorrect();

    const resultText = isCorrect ? "ถูกต้อง เก่งมาก" : `💡 คำใบ้: ${q.hint}`;
    setFeedback(resultText);
    await speakThaiAndWait(isCorrect ? "ถูกต้อง เก่งมาก" : q.hint);

    setSelectedAnswer(null);
    setFeedback(null);
    setIsChecking(false);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      return;
    }

    if (student) {
      const completedAt = nowMs();
      api.recordAssessment({
        student_id: student.id,
        assessment_type: "pretest",
        score: nextScore,
        total_score: questions.length,
      });
      api.recordAttempt({
        student_id: student.id,
        level: 0,
        activity_type: "pretest",
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
    celebrateCompletion();
    speakThai("เก่งมาก พร้อมเริ่มเรียนแล้ว!");
    router.push("/student/path");
  };

  return (
    <div className="min-h-screen bg-sky-50 p-6 flex flex-col items-center">
      <HeaderNav
        title="ลองเล่นก่อนเริ่มกันนะ"
        backUrl="/"
      />

      <div className="w-full max-w-xl bg-white rounded-3xl p-8 shadow-xl border-2 border-sky-200 text-center">
        <div className="text-slate-500 font-bold mb-4">
          ข้อที่ {currentIndex + 1} จาก {questions.length}
        </div>

        <h2 className="text-2xl font-black text-slate-800 mb-6">
          {currentQ?.question}
        </h2>

        {/* Question Target Display */}
        <div className="flex justify-center mb-8">
          {currentQ.type === "identify" && (
            <MoneyCard value={currentQ.money || 10} speakOnClick />
          )}
          {currentQ.type === "match" && (
            <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300">
              <div className="text-5xl mb-2">🥛</div>
              <div className="text-2xl font-bold text-slate-800">
                {currentQ.item}
              </div>
              <div className="text-xl text-emerald-600 font-bold">
                ราคา {currentQ.price} บาท
              </div>
            </div>
          )}
          {currentQ.type === "sum" && (
            <div className="p-4 bg-orange-50 rounded-2xl border-2 border-orange-300">
              <div className="text-4xl mb-2">🧺</div>
              <div className="text-2xl font-bold text-slate-800">
                {currentQ.item}
              </div>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="grid grid-cols-3 gap-4">
          {currentQ.options.map((opt) => (
            <button
              key={opt}
              type="button"
              aria-pressed={selectedAnswer === opt}
              disabled={isChecking}
              onClick={() => selectAnswer(opt)}
              className={`py-5 border-4 rounded-2xl text-2xl font-black text-sky-900 active:scale-95 transition-all shadow ${
                selectedAnswer === opt
                  ? "bg-amber-200 border-amber-500 ring-4 ring-amber-200"
                  : "bg-sky-100 hover:bg-sky-200 border-sky-400"
              }`}>
              {opt} บาท
            </button>
          ))}
        </div>

        {feedback && (
          <div
            role="status"
            className={`mt-5 rounded-2xl border-2 p-3 text-xl font-black ${
              feedback.startsWith("ถูกต้อง")
                ? "border-emerald-400 bg-emerald-100 text-emerald-900"
                : "border-amber-400 bg-amber-100 text-amber-900"
            }`}>
            {feedback}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={confirmAnswer}
            disabled={selectedAnswer === null || isChecking}
            className="rounded-2xl bg-sky-600 px-8 py-4 text-xl font-black text-white shadow-lg transition-all hover:bg-sky-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300">
            ยืนยันคำตอบ
          </button>
        </div>
      </div>
    </div>
  );
}
