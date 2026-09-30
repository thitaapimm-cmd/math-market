"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { api } from "@/lib/storage";
import { playSoundEffect, speakThai } from "@/lib/speech";
import { StudentAvatar } from "@/components/common/StudentAvatar";

const LEVELS = [
  { level: 1, icon: "🪙", title: "รู้จักค่าของเงิน", description: "แยกแยะเหรียญ 5, 10 และธนบัตร 20, 50, 100", iconClass: "from-sky-400 to-sky-600" },
  { level: 2, icon: "🏷️", title: "จับคู่เงินกับราคา", description: "ราคาสินค้า 20 บาท ใช้เงินใบไหน", iconClass: "from-emerald-400 to-emerald-600" },
  { level: 3, icon: "🧃", title: "ซื้อสินค้า 1 ชิ้น", description: "ฝึกรวมเงินหลายใบให้ตรงกับราคาสินค้า", iconClass: "from-amber-400 to-orange-500" },
  { level: 4, icon: "🧺", title: "ซื้อสินค้าหลายชิ้น", description: "รวมราคาสินค้า 2 ชิ้นแล้วจ่ายเงิน", iconClass: "from-orange-400 to-rose-500" },
  { level: 5, icon: "🏪", title: "ไปซื้อของกัน!", description: "จำลองร้านค้าป้ารม & สหกรณ์โรงเรียน", iconClass: "from-violet-500 to-purple-700" },
] as const;

export default function LearningPathPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const { student, progress } = useMemo(() => {
    if (!isMounted) return { student: null, progress: [] };
    const currentStudent = api.getCurrentStudent();
    return {
      student: currentStudent,
      progress: currentStudent ? api.getProgress(currentStudent.id) : [],
    };
  }, [isMounted]);

  useEffect(() => {
    queueMicrotask(() => setIsMounted(true));
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!student) {
      router.push("/");
      return;
    }
    const completed = progress.filter((item) => item.status === "completed").length;
    speakThai(`สวัสดี ${student.name} ตอนนี้หนูผ่านแล้ว ${completed} จาก 5 ระดับ`);
  }, [isMounted, progress, router, student]);

  if (!isMounted || !student) return null;

  const completedCount = progress.filter((item) => item.status === "completed").length;
  const isAllCompleted = completedCount === 5;
  return (
    <main className="min-h-screen bg-[#eef3f8] text-slate-800">
      <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 rounded-2xl focus-visible:outline-4 focus-visible:outline-sky-500">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 text-3xl shadow-sm">🛒</span>
            <span>
              <strong className="block text-xl font-extrabold leading-tight sm:text-2xl">Math Market</strong>
              <span className="hidden text-sm font-semibold text-slate-500 sm:block">จากรู้จักเงิน สู่การซื้อของได้ด้วยตนเอง</span>
            </span>
          </Link>
          <Link href="/teacher/dashboard" className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100">
            🔒 โหมดครู
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="flex flex-col gap-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-2">
              <StudentAvatar avatarUrl={student.avatar_url} alt={`รูปประจำตัวของ ${student.name}`} size={64} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-extrabold sm:text-3xl">สวัสดี {student.name}!</h1>
              <p className="mt-1 font-semibold text-slate-500">เส้นทางการเรียนรู้เรื่องเงินของหนู</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-400">ความก้าวหน้า</p>
              <p className="text-2xl font-black text-amber-600">{completedCount} / 5 ระดับ</p>
            </div>
          </div>
        </section>

        {isAllCompleted && (
          <button
            type="button"
            onClick={() => {
              playSoundEffect("click");
              router.push("/student/complete");
            }}
            className="flex w-full flex-col items-start justify-between gap-4 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 p-5 text-left text-white shadow-lg sm:flex-row sm:items-center"
          >
            <span>
              <strong className="block text-xl font-extrabold">🏆 ยินดีด้วย! หนูผ่านครบ 5 ระดับแล้ว</strong>
              <span className="mt-1 block text-sm text-purple-100">สามารถเข้าฝึกซื้อของในโหมดอิสระได้ทุกเวลา</span>
            </span>
            <span className="rounded-2xl bg-amber-400 px-5 py-3 font-black text-amber-950">เข้าสู่ Free Practice →</span>
          </button>
        )}

        <section aria-label="เส้นทางระดับ 1 ถึง 5" className="space-y-4">
          {LEVELS.map((level) => {
            const item = progress.find((entry) => entry.level === level.level);
            const isLocked = !isAllCompleted && item?.status === "locked";
            const isDone = item?.status === "completed";
            const status = isDone ? "ผ่านแล้ว" : isLocked ? "ยังล็อก" : "กำลังเรียน";

            return (
              <button
                key={level.level}
                type="button"
                disabled={isLocked}
                aria-label={`ระดับ ${level.level} ${level.title} ${status}`}
                onClick={() => {
                  playSoundEffect("click");
                  router.push(`/student/level/${level.level}`);
                }}
                className={`group flex w-full items-center gap-4 rounded-[1.75rem] border bg-white p-4 text-left shadow-[0_8px_24px_rgba(15,23,42,0.07)] transition sm:p-6 ${
                  isLocked
                    ? "cursor-not-allowed border-slate-200 opacity-60"
                    : "border-slate-200 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-xl active:translate-y-0"
                }`}
              >
                <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl shadow-md ${level.iconClass}`}>
                  {level.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">ระดับ {level.level}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                      isDone
                        ? "border border-emerald-300 bg-emerald-100 text-emerald-800"
                        : isLocked
                          ? "bg-slate-100 text-slate-500"
                          : "border border-amber-300 bg-amber-100 text-amber-800"
                    }`}>
                      {isDone ? "✓ " : isLocked ? "🔒 " : "▶ "}{status}
                    </span>
                  </span>
                  <strong className="mt-2 block text-xl font-extrabold sm:text-2xl">{level.title}</strong>
                  <span className="mt-0.5 block text-sm font-semibold text-slate-500 sm:text-base">{level.description}</span>
                </span>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition group-hover:bg-sky-100 group-hover:text-sky-700">
                  {isLocked ? <LockKeyhole className="h-5 w-5" /> : <ArrowRight className="h-7 w-7" />}
                </span>
              </button>
            );
          })}
        </section>
      </div>
    </main>
  );
}
