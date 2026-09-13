import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Student } from "@/types";
import StudentSelectPage from "./page";

const existingStudent: Student = {
  id: "std_1",
  student_code: "101",
  name: "น้องตะวัน",
  classroom: "ป.2/1",
  avatar_url: "👦",
  created_at: "2026-09-13T00:00:00.000Z",
};

const createdStudent: Student = {
  id: "std_new",
  student_code: "NEW-1",
  name: "น้องมะลิ",
  classroom: "",
  avatar_url: "/avatars/student-01.png",
  created_at: "2026-09-13T00:00:00.000Z",
};

const {
  mockPush,
  mockGetStudents,
  mockAddStudent,
  mockSetCurrentStudent,
  mockGetAssessments,
  mockSpeakThai,
  mockPlaySoundEffect,
  mockDeleteStudent,
} = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockGetStudents: vi.fn(),
  mockAddStudent: vi.fn(),
  mockSetCurrentStudent: vi.fn(),
  mockGetAssessments: vi.fn(),
  mockSpeakThai: vi.fn(),
  mockPlaySoundEffect: vi.fn(),
  mockDeleteStudent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/storage", () => ({
  api: {
    getStudents: mockGetStudents,
    addStudent: mockAddStudent,
    setCurrentStudent: mockSetCurrentStudent,
    getAssessments: mockGetAssessments,
    deleteStudent: mockDeleteStudent,
  },
}));

vi.mock("@/lib/speech", () => ({
  speakThai: mockSpeakThai,
  playSoundEffect: mockPlaySoundEffect,
}));

describe("StudentSelectPage", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetStudents.mockReturnValue([existingStudent]);
    mockGetAssessments.mockReturnValue([]);
    mockAddStudent.mockReturnValue(createdStudent);
  });

  it("selects a student without navigating and starts at the pre-test", async () => {
    const user = userEvent.setup();
    render(<StudentSelectPage />);

    await user.click(screen.getByRole("button", { name: /เลือกนักเรียน/ }));
    await user.click(screen.getByRole("button", { name: "น้องตะวัน" }));

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockSetCurrentStudent).not.toHaveBeenCalled();
    const startButton = screen.getByRole("button", { name: "เริ่มเรียนเลย" });
    expect(startButton).toBeEnabled();

    await user.click(startButton);

    expect(mockSetCurrentStudent).toHaveBeenCalledWith(existingStudent);
    expect(mockPush).toHaveBeenCalledWith("/student/pretest");
    expect(mockPlaySoundEffect).toHaveBeenCalledWith("click");
  });

  it("routes an existing student to the learning path when a pre-test exists", async () => {
    const user = userEvent.setup();
    mockGetAssessments.mockReturnValue([
      {
        id: "assessment_1",
        student_id: existingStudent.id,
        assessment_type: "pretest",
        score: 5,
        total_score: 5,
        created_at: "2026-09-13T00:00:00.000Z",
      },
    ]);
    render(<StudentSelectPage />);

    await user.click(screen.getByRole("button", { name: /เลือกนักเรียน/ }));
    await user.click(screen.getByRole("button", { name: "น้องตะวัน" }));
    await user.click(screen.getByRole("button", { name: "เริ่มเรียนเลย" }));

    expect(mockPush).toHaveBeenCalledWith("/student/path");
  });

  it("keeps the start button disabled until a student is selected", async () => {
    const user = userEvent.setup();
    render(<StudentSelectPage />);

    await user.click(screen.getByRole("button", { name: /เลือกนักเรียน/ }));

    expect(screen.getByRole("button", { name: "เริ่มเรียนเลย" })).toBeDisabled();
  });

  it("requires a name and preset avatar before creating a student", async () => {
    const user = userEvent.setup();
    render(<StudentSelectPage />);

    await user.click(screen.getByRole("button", { name: /สร้างนักเรียนใหม่/ }));
    const submit = screen.getByRole("button", { name: "สร้างนักเรียน" });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText("ชื่อนักเรียน"), "น้องมะลิ");
    expect(submit).toBeDisabled();

    await user.click(screen.getByRole("radio", { name: "อวตาร 1" }));
    expect(submit).toBeEnabled();
  });

  it("creates a student from a name and preset avatar", async () => {
    const user = userEvent.setup();
    render(<StudentSelectPage />);

    await user.click(screen.getByRole("button", { name: /สร้างนักเรียนใหม่/ }));
    await user.type(screen.getByLabelText("ชื่อนักเรียน"), "น้องมะลิ");
    await user.click(screen.getByRole("radio", { name: "อวตาร 1" }));
    await user.click(screen.getByRole("button", { name: "สร้างนักเรียน" }));

    expect(mockAddStudent).toHaveBeenCalledWith({
      name: "น้องมะลิ",
      avatar_url: "/avatars/student-01.png",
    });
    expect(screen.getByText("น้องมะลิ")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "น้องมะลิ" })).toHaveAttribute("aria-pressed", "true");
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens a native modal focused on the name field and restores focus after Escape", async () => {
    const user = userEvent.setup();
    render(<StudentSelectPage />);

    const createTrigger = screen.getByRole("button", { name: /สร้างนักเรียนใหม่/ });
    await user.click(createTrigger);

    const dialog = screen.getByRole("dialog");
    expect(dialog.tagName).toBe("DIALOG");
    expect(dialog).toHaveAttribute("open");
    expect(screen.getByLabelText("ชื่อนักเรียน")).toHaveFocus();

    createTrigger.focus();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(createTrigger).toHaveFocus();
    expect(mockAddStudent).not.toHaveBeenCalled();
  });

  it("dismisses student creation without saving", async () => {
    const user = userEvent.setup();
    render(<StudentSelectPage />);

    await user.click(screen.getByRole("button", { name: /สร้างนักเรียนใหม่/ }));
    await user.click(screen.getByRole("button", { name: "ปิด" }));

    expect(mockAddStudent).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes an open native dialog when the page unmounts", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<StudentSelectPage />);

    await user.click(screen.getByRole("button", { name: /สร้างนักเรียนใหม่/ }));
    const dialog = screen.getByRole("dialog") as HTMLDialogElement;
    expect(dialog.open).toBe(true);

    unmount();

    expect(dialog.open).toBe(false);
  });

  it("cancels student deletion without removing the student", async () => {
    const user = userEvent.setup();
    render(<StudentSelectPage />);

    await user.click(screen.getByRole("button", { name: /เลือกนักเรียน/ }));
    await user.click(screen.getByRole("button", { name: "ลบนักเรียน น้องตะวัน" }));

    expect(screen.getByRole("dialog", { name: "ยืนยันการลบนักเรียน" })).toHaveTextContent("น้องตะวัน");
    await user.click(screen.getByRole("button", { name: "ยกเลิก" }));

    expect(mockDeleteStudent).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "น้องตะวัน" })).toBeInTheDocument();
  });

  it("deletes the selected student and disables starting learning", async () => {
    const user = userEvent.setup();
    render(<StudentSelectPage />);

    await user.click(screen.getByRole("button", { name: /เลือกนักเรียน/ }));
    await user.click(screen.getByRole("button", { name: "น้องตะวัน" }));
    expect(screen.getByRole("button", { name: "เริ่มเรียนเลย" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "ลบนักเรียน น้องตะวัน" }));
    await user.click(screen.getByRole("button", { name: "ลบนักเรียน" }));

    expect(mockDeleteStudent).toHaveBeenCalledWith(existingStudent.id);
    expect(screen.queryByRole("button", { name: "น้องตะวัน" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "เริ่มเรียนเลย" })).toBeDisabled();
  });
});
