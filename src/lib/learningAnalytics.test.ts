import { describe,expect,it } from "vitest";
import { formatDuration,getLatestAttemptByLevel,formatAnswer } from "./learningAnalytics";
import type { Attempt } from "@/types";

const base=(id:string,created_at:string):Attempt=>({id,student_id:"s1",level:3,activity_type:"pay",mode:"learning",score:4,total_questions:5,hint_count:1,wrong_count:1,duration_seconds:75,answers:[],created_at});
describe("learning analytics",()=>{
 it("formats duration and money answers",()=>{expect(formatDuration(75)).toBe("1:15");expect(formatAnswer([10,10,20])).toBe("10 + 10 + 20 บาท");});
 it("selects the latest attempt for a student and level",()=>{expect(getLatestAttemptByLevel([base("old","2026-01-01"),base("newest","2026-02-01")],"s1",3)?.id).toBe("newest");});
});
