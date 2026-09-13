"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, CheckCircle, Clock3, Users, type LucideIcon } from "lucide-react";
import { StudentAvatar } from "@/components/common/StudentAvatar";
import { formatAnswer, formatDuration, getLatestAttemptByLevel } from "@/lib/learningAnalytics";
import { getPreliminaryAssessment, normalizeAttempt } from "@/lib/learningSession";
import { api } from "@/lib/storage";

type SummaryCard = { Icon: LucideIcon; label: string; value: string; iconClass: string };

const evaluationClasses: Record<string, string> = {
  emerald: "text-emerald-700",
  amber: "text-amber-700",
  rose: "text-rose-700",
  slate: "text-slate-600",
};

export default function TeacherDashboard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { queueMicrotask(() => setMounted(true)); }, []);

  const data = useMemo(() => {
    if (!mounted) return { students: [], progress: [], assessments: [], attempts: [] };
    const students = api.getStudents();
    return {
      students,
      progress: students.flatMap((student) => api.getProgress(student.id)),
      assessments: api.getAssessments(),
      attempts: api.getAttempts(),
    };
  }, [mounted]);

  if (!mounted) return null;

  const pretests = data.assessments.filter((assessment) => assessment.assessment_type === "pretest");
  const averagePretest = pretests.length
    ? (pretests.reduce((total, assessment) => total + assessment.score, 0) / pretests.length).toFixed(1)
    : "-";
  const passed = (level: number) => data.students.filter((student) => data.progress.some(
    (progress) => progress.student_id === student.id && progress.level === level && progress.status === "completed",
  )).length;
  const summaryCards: SummaryCard[] = [
    { Icon: Users, label: "นักเรียนทั้งหมด", value: `${data.students.length} คน`, iconClass: "bg-blue-100 text-blue-600" },
    { Icon: CheckCircle, label: "ผ่าน Level 1", value: `${passed(1)} คน`, iconClass: "bg-emerald-100 text-emerald-600" },
    { Icon: CheckCircle, label: "ผ่าน Level 5", value: `${passed(5)} คน`, iconClass: "bg-purple-100 text-purple-600" },
    { Icon: BarChart3, label: "Pre-test เฉลี่ย", value: `${averagePretest} / 5`, iconClass: "bg-amber-100 text-amber-600" },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div><h1 className="text-3xl font-black text-slate-800">Teacher Dashboard</h1><p className="font-medium text-slate-500">ติดตามคะแนน เวลา และจุดที่ต้องฝึกรายข้อ</p></div>
          <Link href="/" className="rounded-xl border bg-white px-4 py-2 font-bold">กลับหน้าเด็ก</Link>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-4">
          {summaryCards.map(({ Icon, label, value, iconClass }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm">
              <div className={`rounded-xl p-3 ${iconClass}`}><Icon className="h-7 w-7" /></div>
              <div><div className="text-sm font-semibold text-slate-500">{label}</div><div className="text-3xl font-black">{value}</div></div>
            </div>
          ))}
        </section>

        {data.students.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center font-bold text-slate-500">ยังไม่มีข้อมูลนักเรียน</div>
        ) : (
          <section className="space-y-5">
            {data.students.map((student) => {
              const assessment = data.assessments.filter((item) => item.student_id === student.id && item.assessment_type === "pretest").at(-1);
              const pretestAttempt = getLatestAttemptByLevel(data.attempts, student.id, 0);
              const evaluation = getPreliminaryAssessment(assessment?.score);
              const studentAttempts = data.attempts.filter((attempt) => attempt.student_id === student.id).map(normalizeAttempt).sort((a, b) => Date.parse(b.completed_at) - Date.parse(a.completed_at));
              return (
                <article key={student.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                  <div className="grid gap-4 p-5 lg:grid-cols-[1.4fr_1fr_2fr]">
                    <div className="flex items-center gap-3">
                      <StudentAvatar avatarUrl={student.avatar_url} alt={`รูปประจำตัวของ ${student.name}`} size={48} />
                      <div><h2 className="text-xl font-black">{student.name}</h2><p className="text-sm text-slate-500">{student.classroom || "ยังไม่ระบุห้อง"}</p></div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-500">การประเมินเบื้องต้น</p>
                      <strong className={evaluationClasses[evaluation.tone] ?? evaluationClasses.slate}>{evaluation.label}</strong>
                      <p className="text-sm">{assessment ? `${assessment.score}/5 · ผิด ${pretestAttempt?.wrong_count ?? 5 - assessment.score} ครั้ง` : "ยังไม่มี Pretest"}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {[0, 1, 2, 3, 4, 5].map((level) => {
                        const attempt = getLatestAttemptByLevel(data.attempts, student.id, level);
                        return <div key={level} className="rounded-xl bg-slate-50 p-2 text-center"><div className="text-xs font-bold text-slate-500">{level === 0 ? "Pre" : `L${level}`}</div><div className="font-black">{attempt ? `${attempt.score}/${attempt.total_questions}` : "-"}</div><div className="text-xs text-slate-500">{attempt ? formatDuration(attempt.duration_seconds) : "-"}</div></div>;
                      })}
                    </div>
                  </div>

                  <details open className="border-t">
                    <summary className="cursor-pointer bg-slate-50 px-5 py-3 font-black">รายละเอียดการทำแบบฝึก</summary>
                    <div className="space-y-4 p-5">
                      {studentAttempts.length === 0 ? <p className="text-slate-500">ยังไม่มีประวัติการทำแบบฝึก</p> : studentAttempts.map((attempt) => (
                        <div key={attempt.id} className="rounded-xl border">
                          <div className="flex flex-wrap justify-between gap-2 bg-slate-50 p-3 font-bold">
                            <span>{attempt.level === 0 ? "Pretest" : `Level ${attempt.level}`} · {attempt.score}/{attempt.total_questions}</span>
                            <span className="flex gap-4"><span><Clock3 className="inline h-4 w-4" /> {formatDuration(attempt.duration_seconds)}</span><span>ผิด {attempt.wrong_count} ครั้ง</span></span>
                          </div>
                          <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-sm">
                            <thead><tr className="text-left text-slate-500"><th className="p-3">โจทย์</th><th className="p-3">คำตอบสุดท้าย</th><th className="p-3">ผิด</th><th className="p-3">เวลา</th><th className="p-3">คำใบ้</th></tr></thead>
                            <tbody>{attempt.answers.map((answer) => <tr key={answer.question_id} className="border-t"><td className="p-3 font-semibold">{answer.prompt}</td><td className="p-3">{formatAnswer(answer.answer)}</td><td className="p-3">{answer.wrong_count}</td><td className="p-3">{formatDuration(answer.duration_seconds)}</td><td className="p-3">{answer.hint_used ? "ใช้" : "ไม่ใช้"}</td></tr>)}</tbody>
                          </table></div>
                        </div>
                      ))}
                    </div>
                  </details>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
