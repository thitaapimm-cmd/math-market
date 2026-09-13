"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import { StudentAvatar } from "@/components/common/StudentAvatar";
import { api } from "@/lib/storage";
import { playSoundEffect, speakThai } from "@/lib/speech";
import type { Student } from "@/types";

const PRESET_AVATARS = [
  { value: "/avatars/student-01.png", label: "อวตาร 1" },
  { value: "/avatars/student-02.png", label: "อวตาร 2" },
  { value: "/avatars/student-03.png", label: "อวตาร 3" },
  { value: "/avatars/student-04.png", label: "อวตาร 4" },
  { value: "/avatars/student-05.png", label: "อวตาร 5" },
  { value: "/avatars/student-06.png", label: "อวตาร 6" },
  { value: "/avatars/student-07.png", label: "อวตาร 7" },
  { value: "/avatars/student-08.png", label: "อวตาร 8" },
  { value: "/avatars/student-09.png", label: "อวตาร 9" },
  { value: "/avatars/student-10.png", label: "อวตาร 10" },
] as const;

export default function StudentSelectPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [showStudentGrid, setShowStudentGrid] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [pendingDeleteStudent, setPendingDeleteStudent] = useState<Student | null>(null);
  const createTriggerRef = useRef<HTMLButtonElement>(null);
  const createDialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const loadedStudents = api.getStudents();
    queueMicrotask(() => setStudents(loadedStudents));
    speakThai("เลือกนักเรียน หรือสร้างนักเรียนใหม่");
  }, []);

  const closeCreateDialog = () => {
    createDialogRef.current?.close();
  };

  const handleCreateDialogClose = () => {
    setIsCreateOpen(false);
    setName("");
    setAvatarUrl("");
    createTriggerRef.current?.focus();
  };

  useEffect(() => {
    if (!isCreateOpen) return;

    const dialog = createDialogRef.current;
    if (!dialog) return;

    dialog.showModal();
    dialog.querySelector<HTMLInputElement>("#student-name")?.focus();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, [isCreateOpen]);

  useEffect(() => {
    if (!pendingDeleteStudent) return;
    const dialog = deleteDialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [pendingDeleteStudent]);

  const selectStudent = (student: Student) => {
    playSoundEffect("click");
    setSelectedStudentId(student.id);
    speakThai(`เลือก ${student.name} แล้ว กดเริ่มเรียนได้เลย`);
  };

  const handleStartLearning = () => {
    const student = students.find((item) => item.id === selectedStudentId);
    if (!student) return;

    playSoundEffect("click");
    api.setCurrentStudent(student);
    const hasPretest = api
      .getAssessments(student.id)
      .some((assessment) => assessment.assessment_type === "pretest");
    router.push(hasPretest ? "/student/path" : "/student/pretest");
  };

  const handleCreateStudent = () => {
    if (!name.trim() || !avatarUrl) return;

    playSoundEffect("click");
    const student = api.addStudent({ name: name.trim(), avatar_url: avatarUrl });
    setStudents((current) => [...current, student]);
    setSelectedStudentId(student.id);
    setShowStudentGrid(true);
    closeCreateDialog();
    speakThai(`สร้างนักเรียนใหม่ ${student.name} เรียบร้อยแล้ว`);
  };

  const handleDeleteStudent = () => {
    if (!pendingDeleteStudent) return;
    playSoundEffect("click");
    api.deleteStudent(pendingDeleteStudent.id);
    setStudents((items) => items.filter((item) => item.id !== pendingDeleteStudent.id));
    setSelectedStudentId((id) => id === pendingDeleteStudent.id ? null : id);
    deleteDialogRef.current?.close();
    setPendingDeleteStudent(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-white to-amber-50 px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8 text-center">
          <span className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-4xl shadow-sm">
            🛒
          </span>
          <h1 className="text-3xl font-extrabold text-slate-800 sm:text-4xl">
            เริ่มเรียนกับ Math Market
          </h1>
          <p className="font-reading mt-3 text-lg text-slate-600">
            เลือกชื่อของหนู หรือสร้างนักเรียนใหม่
          </p>
        </header>

        <section aria-label="ทางเลือกนักเรียน" className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              playSoundEffect("click");
              setShowStudentGrid((visible) => !visible);
            }}
            aria-expanded={showStudentGrid}
            className="rounded-3xl border-4 border-sky-200 bg-white p-7 text-left shadow-lg transition-transform hover:-translate-y-1 hover:border-sky-300 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-sky-600"
          >
            <span className="block text-4xl">👋</span>
            <span className="mt-4 block text-2xl font-extrabold text-slate-800">
              เลือกนักเรียน
            </span>
            <span className="mt-1 block text-slate-600">
              เลือกชื่อของหนูเพื่อเรียนต่อ
            </span>
          </button>

          <button
            ref={createTriggerRef}
            type="button"
            onClick={() => {
              playSoundEffect("click");
              setIsCreateOpen(true);
            }}
            className="rounded-3xl border-4 border-emerald-200 bg-emerald-500 p-7 text-left text-white shadow-lg transition-transform hover:-translate-y-1 hover:bg-emerald-600 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
          >
            <span className="block text-4xl">✨</span>
            <span className="mt-4 block text-2xl font-extrabold">สร้างนักเรียนใหม่</span>
            <span className="mt-1 block text-emerald-50">
              ใส่ชื่อและเลือกรูปประจำตัว
            </span>
          </button>
        </section>

        {showStudentGrid && (
          <section aria-labelledby="student-list-heading" className="mt-8 rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200 sm:p-7">
            <h2 id="student-list-heading" className="text-2xl font-extrabold text-slate-800">
              เลือกนักเรียน
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {students.map((student) => (
                <div key={student.id} className="relative">
                  <button
                    type="button"
                    aria-label={student.name}
                    aria-pressed={selectedStudentId === student.id}
                    onClick={() => selectStudent(student)}
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 pr-14 text-left transition-colors focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                      selectedStudentId === student.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 hover:border-sky-300 hover:bg-sky-50"
                    }`}
                  >
                    <StudentAvatar avatarUrl={student.avatar_url} alt={`รูปประจำตัวของ ${student.name}`} size={64} />
                    <span>
                      <span className="block text-xl font-bold text-slate-800">{student.name}</span>
                      {student.classroom && <span className="block text-slate-500">ห้อง {student.classroom}</span>}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`ลบนักเรียน ${student.name}`}
                    onClick={() => {
                      playSoundEffect("click");
                      setPendingDeleteStudent(student);
                    }}
                    className="absolute right-3 top-3 rounded-xl bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
                  >
                    <Trash2 aria-hidden="true" className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              disabled={!selectedStudentId}
              onClick={handleStartLearning}
              className="mt-6 w-full rounded-2xl bg-emerald-500 px-5 py-4 text-xl font-extrabold text-white shadow-lg transition-all hover:bg-emerald-600 active:translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              เริ่มเรียนเลย
            </button>
          </section>
        )}
      </div>

      {isCreateOpen && (
          <dialog
            ref={createDialogRef}
            aria-modal="true"
            aria-labelledby="create-student-title"
            onCancel={(event) => {
              event.preventDefault();
              closeCreateDialog();
            }}
            onClose={handleCreateDialogClose}
            className="m-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl backdrop:bg-slate-950/45 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="create-student-title" className="text-2xl font-extrabold text-slate-800">
                  สร้างนักเรียนใหม่
                </h2>
                <p className="mt-1 text-slate-600">ใส่ชื่อและเลือกรูปที่หนูชอบ</p>
              </div>
              <button
                type="button"
                aria-label="ปิด"
                onClick={closeCreateDialog}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              >
                <X aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-6">
              <label htmlFor="student-name" className="block text-lg font-bold text-slate-800">
                ชื่อนักเรียน
              </label>
              <input
                id="student-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoComplete="off"
                className="mt-2 w-full rounded-2xl border-2 border-slate-300 px-4 py-3 text-lg text-slate-800 outline-none transition-colors focus:border-sky-500"
              />
            </div>

            <fieldset className="mt-6">
              <legend className="text-lg font-bold text-slate-800">เลือกรูปประจำตัว</legend>
              <div className="mt-3 grid grid-cols-5 gap-2 sm:gap-3">
                {PRESET_AVATARS.map((avatar) => (
                  <label
                    key={avatar.value}
                    className={`cursor-pointer rounded-2xl border-4 p-1 transition-colors focus-within:outline-4 focus-within:outline-offset-2 focus-within:outline-sky-600 ${
                      avatarUrl === avatar.value
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-transparent hover:border-sky-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="student-avatar"
                      value={avatar.value}
                      checked={avatarUrl === avatar.value}
                      onChange={() => setAvatarUrl(avatar.value)}
                      aria-label={avatar.label}
                      className="sr-only"
                    />
                    <StudentAvatar avatarUrl={avatar.value} alt="" size={96} className="h-auto w-full" />
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              disabled={!name.trim() || !avatarUrl}
              onClick={handleCreateStudent}
              className="mt-7 w-full rounded-2xl bg-emerald-500 px-5 py-4 text-xl font-extrabold text-white shadow-lg transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              สร้างนักเรียน
            </button>
          </dialog>
      )}

      {pendingDeleteStudent && (
        <dialog
          ref={deleteDialogRef}
          aria-modal="true"
          aria-labelledby="delete-student-title"
          onCancel={(event) => {
            event.preventDefault();
            deleteDialogRef.current?.close();
            setPendingDeleteStudent(null);
          }}
          className="m-auto w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl backdrop:bg-slate-950/45"
        >
          <h2 id="delete-student-title" className="text-2xl font-extrabold text-slate-800">ยืนยันการลบนักเรียน</h2>
          <p className="mt-3 text-slate-600">
            ต้องการลบ <strong>{pendingDeleteStudent.name}</strong> ใช่ไหม? คะแนน ความก้าวหน้า Pretest และประวัติการทำแบบฝึกจะถูกลบด้วย
          </p>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => { deleteDialogRef.current?.close(); setPendingDeleteStudent(null); }} className="rounded-2xl bg-slate-200 px-4 py-3 font-bold text-slate-800">ยกเลิก</button>
            <button type="button" onClick={handleDeleteStudent} className="rounded-2xl bg-rose-600 px-4 py-3 font-bold text-white hover:bg-rose-700">ลบนักเรียน</button>
          </div>
        </dialog>
      )}
    </main>
  );
}
