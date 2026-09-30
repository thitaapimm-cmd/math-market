import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-sky-100 via-white to-amber-50 p-6">
      <div className="pointer-events-none absolute -top-24 left-8 h-64 w-64 rounded-full bg-amber-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-8 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />

      <Link
        href="/student/select"
        aria-label="เข้าสู่ Math Market"
        className="relative w-full max-w-xl rounded-[2rem] border-4 border-sky-200 bg-white p-8 text-center shadow-2xl transition-transform hover:-translate-y-1 hover:border-sky-300 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-sky-600 sm:p-12"
      >
        <span className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100 text-5xl shadow-sm">
          🛒
        </span>
        <p className="mb-3 text-lg font-bold text-amber-800">Math Market</p>
        <h1 className="text-3xl font-extrabold text-slate-800 sm:text-4xl">
          เรียนรู้เรื่องเงินผ่านการซื้อของ
        </h1>
        <p className="font-reading mt-4 text-lg text-slate-600">
          เริ่มต้นเลือกซื้อของในตลาดแสนสนุกได้เลย
        </p>
        <span className="mt-8 inline-flex rounded-2xl bg-emerald-500 px-7 py-4 text-xl font-bold text-white shadow-lg">
          เข้าสู่ Math Market
        </span>
      </Link>

      <Link
        href="/teacher/dashboard"
        className="fixed bottom-6 left-6 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-600 shadow-md ring-1 ring-slate-200 transition-colors hover:bg-white hover:text-slate-900 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
      >
        สำหรับคุณครู (Teacher Mode)
      </Link>
    </main>
  );
}
