"use client";

export function SpeechStatus({
  locked,
  unavailable,
  onReplay,
}: {
  locked: boolean;
  unavailable: boolean;
  onReplay: () => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-center gap-3 text-sm font-bold" aria-live="polite">
      <span>{locked ? "🔊 กำลังอ่าน กรุณาฟังให้จบ" : unavailable ? "🔇 เล่นเสียงไม่ได้ อ่านโจทย์บนหน้าจอแล้วลองฟังอีกครั้ง" : "พร้อมตอบแล้ว"}</span>
      <button type="button" onClick={onReplay} disabled={locked} className="rounded-xl border-2 border-sky-400 bg-white px-3 py-2 disabled:opacity-50">
        🔊 ฟังโจทย์อีกครั้ง
      </button>
    </div>
  );
}
