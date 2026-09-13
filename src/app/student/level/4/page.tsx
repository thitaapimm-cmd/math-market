"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HeaderNav } from "@/components/common/HeaderNav";
import { MoneyQuantitySelector } from "@/components/common/MoneyQuantitySelector";
import { celebrateCompletion, celebrateCorrect } from "@/lib/celebration";
import { nowMs, secondsBetween, shuffleQuestions } from "@/lib/learningSession";
import { expandMoneyQuantities, formatMoneyEquation, sumMoneyQuantities, type MoneyQuantities } from "@/lib/money";
import { playSoundEffect, speakThai } from "@/lib/speech";
import { api } from "@/lib/storage";
import type { AttemptAnswer } from "@/types";

const QUESTIONS = [
  { id:"l4-1", items:[{name:"นม",price:20,emoji:"🥛"},{name:"ขนมปัง",price:10,emoji:"🍞"}], total:30, options:[20,30,40], sumHint:"ลองบวก 20 บาท กับ 10 บาท รวมกันอีกครั้งนะ" },
  { id:"l4-2", items:[{name:"ดินสอ",price:10,emoji:"✏️"},{name:"สมุด",price:20,emoji:"📓"}], total:30, options:[20,30,50], sumHint:"ดินสอ 10 บาท บวกสมุด 20 บาท เท่ากับ 30 บาท" },
  { id:"l4-3", items:[{name:"น้ำผลไม้",price:20,emoji:"🧃"},{name:"คุกกี้",price:5,emoji:"🍪"}], total:25, options:[20,25,30], sumHint:"น้ำผลไม้ 20 บาท บวกคุกกี้ 5 บาท เท่ากับ 25 บาท" },
  { id:"l4-4", items:[{name:"ยางลบ",price:5,emoji:"🧽"},{name:"ไม้บรรทัด",price:10,emoji:"📏"}], total:15, options:[10,15,20], sumHint:"ยางลบ 5 บาท บวกไม้บรรทัด 10 บาท เท่ากับ 15 บาท" },
  { id:"l4-5", items:[{name:"สีไม้",price:30,emoji:"🖍️"},{name:"สมุดวาดเขียน",price:20,emoji:"📒"}], total:50, options:[40,50,60], sumHint:"สีไม้ 30 บาท บวกสมุด 20 บาท เท่ากับ 50 บาท" },
] as const;
const MONEY_VALUES = [5,10,20,50] as const;

export default function Level4Page() {
  const router = useRouter();
  const [questions,setQuestions]=useState(()=>[...QUESTIONS]);
  const [index,setIndex]=useState(0); const [step,setStep]=useState<1|2>(1);
  const [selectedTotal,setSelectedTotal]=useState<number|null>(null);
  const [quantities,setQuantities]=useState<MoneyQuantities>({});
  const [wrong,setWrong]=useState(0); const [score,setScore]=useState(0);
  const [feedback,setFeedback]=useState<string|null>(null); const [checking,setChecking]=useState(false);
  const [mounted,setMounted]=useState(false); const sessionStart=useRef(0); const questionStart=useRef(0);
  const answers=useRef<AttemptAnswer[]>([]);
  const student=useMemo(()=>mounted?api.getCurrentStudent():null,[mounted]);
  useEffect(()=>{queueMicrotask(()=>{setQuestions(shuffleQuestions(QUESTIONS));sessionStart.current=nowMs();setMounted(true);});},[]);
  const q=questions[index]; const total=sumMoneyQuantities(quantities);
  const prompt=step===1?`${q.items[0].name} ${q.items[0].price} บาท กับ ${q.items[1].name} ${q.items[1].price} บาท รวมทั้งหมดกี่บาท?`:`เลือกเงินให้ครบ ${q.total} บาท`;
  useEffect(()=>{if(mounted&&!student)router.push("/");},[mounted,student,router]);
  useEffect(()=>{if(mounted&&student){questionStart.current=nowMs();speakThai(prompt);}},[q,step,prompt,mounted,student]);

  const confirmTotal=()=>{if(selectedTotal===null||checking)return;if(selectedTotal!==q.total){playSoundEffect("wrong");setWrong(v=>v+1);setFeedback(q.sumHint);speakThai(q.sumHint);return;}playSoundEffect("correct");celebrateCorrect();setChecking(true);setFeedback(`ถูกต้อง! รวม ${q.total} บาท`);speakThai(`ถูกต้อง รวม ${q.total} บาท ต่อไปเลือกเงินจ่ายนะ`);setTimeout(()=>{setStep(2);setChecking(false);setFeedback(null);},1200);};
  const pay=()=>{if(total===0||checking)return;if(total!==q.total){playSoundEffect("wrong");const hint=`เลือกเงินให้ครบ ${q.total} บาทพอดีนะ`;setWrong(v=>v+1);setFeedback(hint);speakThai(hint);return;}const first=wrong===0;const nextScore=first?score+1:score;const nextAnswers=[...answers.current,{question_id:q.id,prompt,answer:expandMoneyQuantities(quantities),correct:true,first_try_correct:first,hint_used:wrong>0,wrong_count:wrong,duration_seconds:secondsBetween(questionStart.current,nowMs()),steps:[]}];answers.current=nextAnswers;setScore(nextScore);setChecking(true);playSoundEffect("correct");celebrateCorrect();setFeedback(`ถูกต้อง! ${formatMoneyEquation(quantities)}`);speakThai("ถูกต้องแล้ว จ่ายเงินสำเร็จ");setTimeout(()=>advance(nextScore,nextAnswers),1400);};
  const advance=(nextScore:number,nextAnswers:AttemptAnswer[])=>{setStep(1);setSelectedTotal(null);setQuantities({});setWrong(0);setFeedback(null);setChecking(false);if(index+1<questions.length){setIndex(index+1);return;}const end=nowMs();if(student){api.recordAttempt({student_id:student.id,level:4,activity_type:"multi_item_payment",mode:"learning",score:nextScore,total_questions:5,hint_count:nextAnswers.filter(a=>a.hint_used).length,wrong_count:nextAnswers.reduce((n,a)=>n+(a.wrong_count??0),0),duration_seconds:secondsBetween(sessionStart.current,end),started_at:new Date(sessionStart.current).toISOString(),completed_at:new Date(end).toISOString(),answers:nextAnswers});if(nextScore>=4)api.completeLevel(student.id,4,nextScore);}if(nextScore>=4){celebrateCompletion();speakThai("เก่งมาก ผ่านด่านที่ 4 แล้ว");router.push("/student/path");}else{setQuestions(shuffleQuestions(QUESTIONS));setIndex(0);setScore(0);answers.current=[];sessionStart.current=nowMs();speakThai("ลองใหม่อีกครั้งนะ");}};
  return <div className="min-h-screen bg-orange-50 p-6 flex flex-col items-center"><HeaderNav title="Level 4: ซื้อสินค้าหลายชิ้น" backUrl="/student/path"/><div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-xl border-4 border-orange-400 text-center"><div className="mb-3 font-bold text-slate-500">ข้อที่ {index+1} จาก {questions.length}</div><div className="grid grid-cols-2 gap-4 mb-6">{q.items.map(item=><div key={item.name} className="p-4 bg-orange-50 rounded-2xl border-2 border-orange-200"><div className="text-5xl">{item.emoji}</div><div className="text-xl font-bold">{item.name}</div><div className="text-lg font-black text-orange-600">{item.price} บาท</div></div>)}</div>{feedback&&<div role="status" className="p-3 mb-4 rounded-xl bg-amber-100 font-bold">{feedback}</div>}{step===1?<><h3 className="text-2xl font-black mb-4">ทั้งหมดกี่บาท?</h3><div className="grid grid-cols-3 gap-4">{q.options.map(opt=><button type="button" aria-pressed={selectedTotal===opt} onClick={()=>setSelectedTotal(opt)} key={opt} className="py-4 bg-orange-100 border-4 border-orange-400 rounded-2xl text-2xl font-black">{opt} บาท</button>)}</div><button type="button" disabled={selectedTotal===null||checking} onClick={confirmTotal} className="mt-5 w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xl disabled:bg-slate-300">ยืนยันคำตอบ</button></>:<><h3 className="text-2xl font-black mb-3">เลือกเงินให้ครบ {q.total} บาท</h3><div className="p-3 bg-slate-100 rounded-xl mb-4 text-xl font-black">{formatMoneyEquation(quantities)}</div><MoneyQuantitySelector values={MONEY_VALUES} quantities={quantities} onChange={setQuantities} disabled={checking}/><button type="button" disabled={total===0||checking} onClick={pay} className="mt-5 w-full py-5 bg-orange-500 text-white rounded-2xl font-black text-2xl disabled:bg-slate-300">จ่ายเงิน</button></>}</div></div>;
}
