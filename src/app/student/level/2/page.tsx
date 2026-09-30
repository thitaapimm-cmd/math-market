"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/storage";
import { playSoundEffect, speakThai } from "@/lib/speech";
import { MoneyCard } from "@/components/common/MoneyCard";
import { HeaderNav } from "@/components/common/HeaderNav";
import { celebrateCompletion, celebrateCorrect } from "@/lib/celebration";
import { getMoneySpeech, type MoneyValue } from "@/lib/money";
import { useLessonAudio } from "@/lib/useLessonAudio";
import { SpeechStatus } from "@/components/common/SpeechStatus";
import { nowMs, secondsBetween, shuffleQuestions } from "@/lib/learningSession";
import type { AttemptAnswer } from "@/types";
import { productById } from "@/lib/catalog";
import { ProductImage } from "@/components/common/ProductImage";

const QUESTIONS = [
  "rom_fried_chicken", "coop_cookie", "rom_thai_tea", "coop_oreo", "coop_pocky",
].map((id, index) => {
  const product = productById(id);
  return {
    id: `l2-${index + 1}`, item: product.name, price: product.price, product,
    options: [5, 10, 20] as MoneyValue[],
    hint: `${product.name} ราคา ${product.price} บาท ให้เลือกเงิน ${product.price} บาท`,
  };
});

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
  const audio = useLessonAudio(currentPrompt, currentQ.id, isMounted && Boolean(student));

  useEffect(() => {
    if (!isMounted) return;
    if (!student) router.push("/");
  }, [isMounted, router, student]);

  useEffect(() => {
    if (!isMounted || !student) return;
    questionStartedAt.current = nowMs();
  }, [currentPrompt, isMounted, student]);

  const selectAnswer = (choice: MoneyValue) => {
    if (isChecking || audio.isBusy()) return;
    playSoundEffect("click");
    setSelectedAnswer(choice);
    setFeedback(null);
    speakThai(getMoneySpeech(choice));
  };

  const confirmAnswer = () => {
    if (selectedAnswer === null || isChecking || audio.isBusy()) return;

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
      void audio.say("ถูกต้อง เก่งมาก").then((result) => { if (result !== "cancelled") proceedNext(nextScore, nextAnswers); });
      setScore(nextScore);
    } else {
      playSoundEffect("wrong");
      setFeedback(
        `ยังไม่ใช่นะ หนูเลือก ${getMoneySpeech(choice)} ${currentQ.item} ราคา ${currentQ.price} บาท`,
      );
      setHint(currentQ.hint);
      setQuestionWrongCount((count) => count + 1);
      void audio.say(currentQ.hint);
    }
  };

  const proceedNext = async (
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
        await audio.say("เก่งมาก! หนูจับคู่เงินกับราคาสินค้าได้ถูกต้องแล้ว");
        router.push("/student/path");
      } else {
        await audio.say("ลองอีกครั้งนะคนเก่ง");
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

      <div className="w-full max-w-6xl bg-white rounded-3xl p-5 sm:p-8 shadow-xl border-4 border-emerald-400 text-center">
        <div className="text-slate-500 font-bold mb-2">
          ข้อที่ {index + 1} จาก {questions.length}
        </div>
        <SpeechStatus locked={audio.locked} unavailable={audio.audioUnavailable} onReplay={audio.replay} />

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-center lg:gap-8">
        <div className="p-6 bg-emerald-50 rounded-3xl border-2 border-emerald-200 mb-6 lg:mb-0">
          <div className="mb-3"><ProductImage product={currentQ.product} size={128} /></div>
          <h2 className="text-3xl font-black text-slate-800 mb-1">
            {currentQ.item}
          </h2>
          <div className="text-2xl font-black text-emerald-700">
            ราคา {currentQ.price} บาท
          </div>
        </div>

        <div className="min-w-0">
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
              disabled={audio.locked || isChecking}
              onClick={() => selectAnswer(opt)}
            />
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={confirmAnswer}
            disabled={selectedAnswer === null || isChecking || audio.locked}
            className="rounded-2xl bg-emerald-600 px-8 py-4 text-xl font-black text-white shadow-lg transition-all hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300">
            ยืนยันคำตอบ
          </button>
        </div>
        </div>
        </div>
      </div>
    </div>
  );
}
