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

const QUESTIONS = [
  {
    id: "1",
    money: 10,
    options: [5, 10, 20],
    correct: 10,
    hint: "สังเกตตัวเลข 10 บนเหรียญนะจ๊ะ",
  },
  {
    id: "2",
    money: 20,
    options: [20, 50, 100],
    correct: 20,
    hint: "ธนบัตรสีเขียว มีเลข 20 อยู่ตรงมุม",
  },
  {
    id: "3",
    money: 50,
    options: [20, 50, 100],
    correct: 50,
    hint: "ธนบัตรสีฟ้า มีเลข 50 ชัดเจนเลยนะ",
  },
  {
    id: "4",
    money: 100,
    options: [20, 50, 100],
    correct: 100,
    hint: "ธนบัตรสีแดง มีเลข 100 อยู่จ้า",
  },
  {
    id: "5",
    money: 5,
    options: [1, 5, 10],
    correct: 5,
    hint: "สังเกตตัวเลข 5 บนเหรียญนะจ๊ะ",
  },
] as const;

export default function Level1Page() {
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
  const audio = useLessonAudio("เงินนี้มีค่าเท่าไร?", currentQ.id, isMounted && Boolean(student));

  useEffect(() => {
    if (!isMounted) return;
    if (!student) router.push("/");
  }, [isMounted, router, student]);

  useEffect(() => {
    if (!isMounted || !student) return;
    questionStartedAt.current = nowMs();
  }, [currentQ, isMounted, student]);

  const selectAnswer = (choice: MoneyValue) => {
    if (isChecking || audio.isBusy()) return;
    playSoundEffect("click");
    speakThai(getMoneySpeech(choice));
    setSelectedAnswer(choice);
    setFeedback(null);
  };

  const confirmAnswer = () => {
    if (selectedAnswer === null || isChecking || audio.isBusy()) return;

    const choice = selectedAnswer;
    if (choice === currentQ.correct) {
      const firstTryCorrect = questionWrongCount === 0;
      const nextScore = firstTryCorrect ? score + 1 : score;
      const nextAnswers: AttemptAnswer[] = [
        ...answers.current,
        {
          question_id: currentQ.id,
          prompt: "เงินนี้มีค่าเท่าไร?",
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
      setFeedback(`ถูกต้อง! นี่คือ ${currentQ.correct} บาท`);
      void audio.say("ถูกต้อง เก่งมาก").then((result) => { if (result !== "cancelled") proceedNext(nextScore, nextAnswers); });
      setScore(nextScore);
    } else {
      playSoundEffect("wrong");
      setFeedback(`ยังไม่ถูกนะ หนูเลือก ${getMoneySpeech(choice)}`);
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
      // จบ Session 5 ข้อ
      const passed = finalScore >= 4; // Passing 80% (4 จาก 5)
      if (student) {
        const completedAt = nowMs();
        api.recordAttempt({
          student_id: student.id,
          level: 1,
          activity_type: "identify_money",
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
        if (passed) {
          api.completeLevel(student.id, 1, finalScore);
        }
      }

      if (passed) {
        celebrateCompletion();
        await audio.say("เยี่ยมมาก! หนูรู้จักเงินแล้ว ปลดล็อกด่านที่ 2 แล้วจ้า");
        router.push("/student/path");
      } else {
        await audio.say("ไม่เป็นไรนะ ลองใหม่อีกครั้งเพื่อสะสมดาวกันเถอะ");
        setQuestions(shuffleQuestions(QUESTIONS));
        setIndex(0);
        setScore(0);
        answers.current = [];
        sessionStartedAt.current = nowMs();
      }
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 p-6 flex flex-col items-center">
      <HeaderNav
        title="Level 1: รู้จักค่าของเงิน"
        backUrl="/student/path"
      />

      <div className="w-full max-w-xl bg-white rounded-3xl p-8 shadow-xl border-4 border-sky-300 text-center">
        <div className="text-slate-500 font-bold mb-4">
          ข้อที่ {index + 1} จาก {questions.length}
        </div>

        <div className="flex justify-center mb-8">
          <MoneyCard value={currentQ.money} size="lg" disabled={audio.locked || isChecking} onClick={() => { void audio.say(getMoneySpeech(currentQ.money)); }} />
        </div>

        <h2 className="text-3xl font-black text-slate-800 mb-6">
          เงินนี้มีค่าเท่าไร?
        </h2>
        <SpeechStatus locked={audio.locked} unavailable={audio.audioUnavailable} onReplay={audio.replay} />

        {hint && (
          <div className="p-3 bg-amber-100 border-2 border-amber-400 text-amber-900 rounded-2xl mb-4 font-bold text-lg animate-bounce">
            💡 คำใบ้: {hint}
          </div>
        )}

        {feedback && (
          <div className="p-3 bg-emerald-100 border-2 border-emerald-400 text-emerald-900 rounded-2xl mb-4 font-black text-2xl">
            {feedback}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {currentQ.options.map((opt) => (
            <button
              key={opt}
              type="button"
              aria-pressed={selectedAnswer === opt}
              disabled={isChecking || audio.locked}
              onClick={() => selectAnswer(opt)}
              className={`py-5 border-4 text-sky-950 rounded-3xl text-3xl font-black active:scale-95 transition-all shadow-md ${
                selectedAnswer === opt
                  ? "bg-amber-200 border-amber-500 ring-4 ring-amber-200"
                  : "bg-sky-100 hover:bg-sky-200 border-sky-400"
              }`}>
              {opt} บาท
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={confirmAnswer}
            disabled={selectedAnswer === null || isChecking || audio.locked}
            className="rounded-2xl bg-sky-600 px-8 py-4 text-xl font-black text-white shadow-lg transition-all hover:bg-sky-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300">
            ยืนยันคำตอบ
          </button>
        </div>
      </div>
    </div>
  );
}
