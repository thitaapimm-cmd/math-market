"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/storage";
import { speakThai, playSoundEffect } from "@/lib/speech";
import { celebrateCompletion } from "@/lib/celebration";
import { Trophy, RefreshCw, Layers, ShoppingCart } from "lucide-react";

export default function CompleteCelebrationPage() {
  const router = useRouter();
  const student = api.getCurrentStudent();

  useEffect(() => {
    playSoundEffect("celebrate");
    celebrateCompletion();
    speakThai(
      `ยินดีด้วย น้อง ${student?.name || ""} หนูผ่านครบ 5 ระดับแล้ว พร้อมฝึกซื้อของด้วยตัวเองแล้วจ้า`,
    );
  }, [student]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-100 via-purple-50 to-pink-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-xl bg-white rounded-3xl p-8 shadow-2xl border-4 border-amber-300">
        <div className="w-28 h-28 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-amber-400">
          <Trophy className="w-16 h-16 text-amber-500 animate-bounce" />
        </div>

        <h1 className="text-4xl font-black text-slate-800 mb-2">
          หนูผ่านครบ 5 ระดับแล้ว!
        </h1>
        <p className="text-xl text-slate-600 font-bold mb-8">
          หนูพร้อมฝึกซื้อของด้วยตัวเองแล้ว เก่งมากๆ เลย
        </p>

        <div className="space-y-4">
          <button
            onClick={() => router.push("/student/level/5")}
            className="w-full py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-2xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all">
            <ShoppingCart className="w-7 h-7" /> ไปซื้อของ (Free Practice)
          </button>

          <button
            onClick={() => router.push("/student/path")}
            className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow active:scale-95 transition-all">
            <Layers className="w-6 h-6" /> เลือกด่าน 1–5 ได้อย่างอิสระ
          </button>

          <button
            onClick={() => router.push("/student/path")}
            className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all">
            <RefreshCw className="w-5 h-5" /> เล่นใหม่ (ไม่ลบสถิติเดิม)
          </button>
        </div>
      </div>
    </main>
  );
}
