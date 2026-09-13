import { cleanup,render,screen } from "@testing-library/react";
import { afterEach,describe,expect,it,vi } from "vitest";
import TeacherDashboard from "./page";

vi.mock("@/lib/storage",()=>({api:{
 getStudents:()=>[{id:"s1",student_code:"1",name:"น้องดาว",classroom:"ป.2",avatar_url:"/avatars/student-01.png",created_at:"2026-01-01"}],
 getProgress:()=>[{student_id:"s1",level:1,status:"completed",best_score:4,first_score:4,attempt_count:1}],
 getAssessments:()=>[{id:"a1",student_id:"s1",assessment_type:"pretest",score:4,total_score:5,created_at:"2026-01-01"}],
 getAttempts:()=>[{id:"t1",student_id:"s1",level:0,activity_type:"pretest",mode:"learning",score:4,total_questions:5,hint_count:1,wrong_count:1,duration_seconds:75,answers:[{question_id:"q1",prompt:"นี่คือเงินกี่บาท?",answer:10,correct:true,first_try_correct:true,hint_used:false,wrong_count:0,duration_seconds:12}],created_at:"2026-01-01"}],
}}));

describe("TeacherDashboard analytics", () => {
  afterEach(cleanup);

  it("shows evidence-backed assessment and per-question details", async () => {
    render(<TeacherDashboard />);
    expect(await screen.findByText("พร้อมเรียนต่อ")).toBeInTheDocument();
    expect(screen.getByText("4/5 · ผิด 1 ครั้ง")).toBeInTheDocument();
    expect(screen.getByText("นี่คือเงินกี่บาท?")).toBeInTheDocument();
    expect(screen.getAllByText("1:15")).toHaveLength(2);
  });
});
