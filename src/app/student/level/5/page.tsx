"use client";
import { useEffect,useMemo,useRef,useState } from "react";
import { useRouter } from "next/navigation";
import { HeaderNav } from "@/components/common/HeaderNav";
import { MoneyQuantitySelector } from "@/components/common/MoneyQuantitySelector";
import { celebrateCompletion,celebrateCorrect } from "@/lib/celebration";
import { nowMs,secondsBetween,shuffleQuestions } from "@/lib/learningSession";
import { expandMoneyQuantities,formatMoneyEquation,sumMoneyQuantities,type MoneyQuantities } from "@/lib/money";
import { playSoundEffect,speakThai } from "@/lib/speech";
import { api } from "@/lib/storage";
import type { AttemptAnswer } from "@/types";

const SCENARIOS=[
 {id:"l5-1",shop:"ร้านค้าป้ารม",shopIcon:"🏪",items:[{name:"ขนมปัง",price:10,emoji:"🍞"}]},
 {id:"l5-2",shop:"สหกรณ์โรงเรียน",shopIcon:"🏫",items:[{name:"สมุด",price:20,emoji:"📓"}]},
 {id:"l5-3",shop:"ร้านค้าป้ารม",shopIcon:"🏪",items:[{name:"น้ำผลไม้",price:20,emoji:"🧃"},{name:"คุกกี้",price:10,emoji:"🍪"}]},
 {id:"l5-4",shop:"สหกรณ์โรงเรียน",shopIcon:"🏫",items:[{name:"ดินสอ",price:10,emoji:"✏️"},{name:"ยางลบ",price:5,emoji:"🧽"}]},
 {id:"l5-5",shop:"ร้านค้าป้ารม",shopIcon:"🏪",items:[{name:"นมสด",price:20,emoji:"🥛"},{name:"แซนด์วิช",price:30,emoji:"🥪"}]},
] as const;
const SHOPS=[{name:"ร้านค้าป้ารม",icon:"🏪"},{name:"สหกรณ์โรงเรียน",icon:"🏫"}] as const;
const PRODUCTS=[{name:"ขนมปัง",price:10,emoji:"🍞"},{name:"สมุด",price:20,emoji:"📓"},{name:"น้ำผลไม้",price:20,emoji:"🧃"},{name:"คุกกี้",price:10,emoji:"🍪"},{name:"ดินสอ",price:10,emoji:"✏️"},{name:"ยางลบ",price:5,emoji:"🧽"},{name:"นมสด",price:20,emoji:"🥛"},{name:"แซนด์วิช",price:30,emoji:"🥪"}] as const;
const MONEY=[5,10,20,50,100] as const;

export default function Level5Page(){
 const router=useRouter(); const [scenarios,setScenarios]=useState(()=>[...SCENARIOS]); const [index,setIndex]=useState(0);
 const [phase,setPhase]=useState<"shop"|"items"|"pay">("shop"); const [shop,setShop]=useState<string|null>(null); const [items,setItems]=useState<string[]>([]); const [quantities,setQuantities]=useState<MoneyQuantities>({});
 const [feedback,setFeedback]=useState<string|null>(null); const [wrong,setWrong]=useState(0); const [score,setScore]=useState(0); const [mounted,setMounted]=useState(false);
 const start=useRef(0); const qStart=useRef(0); const answers=useRef<AttemptAnswer[]>([]); const student=useMemo(()=>mounted?api.getCurrentStudent():null,[mounted]);
 useEffect(()=>{queueMicrotask(()=>{setScenarios(shuffleQuestions(SCENARIOS));start.current=nowMs();setMounted(true);});},[]);
 const q=scenarios[index]; const total=q.items.reduce((n,i)=>n+i.price,0); const prompt=`ไป${q.shop} แล้วเลือก${q.items.map(i=>i.name).join(" และ ")} ราคา ${total} บาท`; const moneyTotal=sumMoneyQuantities(quantities);
 useEffect(()=>{if(mounted&&!student)router.push("/");},[mounted,student,router]);
 useEffect(()=>{if(!mounted||!student)return;qStart.current=nowMs();speakThai(phase==="shop"?prompt:phase==="items"?`เลือก${q.items.map(i=>i.name).join(" และ ")} ใส่ตะกร้า`:`ยอด ${total} บาท เลือกเงินให้พอดี`);},[q,phase,prompt,total,mounted,student]);
 const wrongAnswer=(hint:string)=>{playSoundEffect("wrong");setWrong(v=>v+1);setFeedback(hint);speakThai(hint);};
 const confirmShop=()=>{if(shop!==q.shop){wrongAnswer(`คำใบ้: โจทย์บอกให้ไป${q.shop}`);return;}playSoundEffect("correct");setFeedback(null);setPhase("items");};
 const confirmItems=()=>{const target=[...q.items.map(i=>i.name)].sort().join("|");const selected=[...items].sort().join("|");if(selected!==target){wrongAnswer(`คำใบ้: เลือก${q.items.map(i=>i.name).join(" และ ")}ให้ครบ`);return;}playSoundEffect("correct");setFeedback(null);setPhase("pay");};
 const pay=()=>{if(moneyTotal!==total){wrongAnswer(moneyTotal<total?`ตอนนี้มี ${moneyTotal} บาท ยังขาดอีก ${total-moneyTotal} บาท ลองเพิ่มเงินดูนะ`:`ตอนนี้มี ${moneyTotal} บาท เกินราคา ${moneyTotal-total} บาท ลองลดเงินดูนะ`);return;}const first=wrong===0;const nextScore=first?score+1:score;const nextAnswers=[...answers.current,{question_id:q.id,prompt,answer:expandMoneyQuantities(quantities),correct:true,first_try_correct:first,hint_used:wrong>0,wrong_count:wrong,duration_seconds:secondsBetween(qStart.current,nowMs())}];answers.current=nextAnswers;setScore(nextScore);playSoundEffect("correct");celebrateCorrect();setFeedback("ถูกต้อง ซื้อของสำเร็จ!");speakThai("ถูกต้อง ซื้อของสำเร็จ");setTimeout(()=>advance(nextScore,nextAnswers),1400);};
 const advance=(nextScore:number,nextAnswers:AttemptAnswer[])=>{setShop(null);setItems([]);setQuantities({});setFeedback(null);setWrong(0);setPhase("shop");if(index+1<5){setIndex(index+1);return;}const end=nowMs();if(student){api.recordAttempt({student_id:student.id,level:5,activity_type:"guided_shopping",mode:"learning",score:nextScore,total_questions:5,hint_count:nextAnswers.filter(a=>a.hint_used).length,wrong_count:nextAnswers.reduce((n,a)=>n+(a.wrong_count??0),0),duration_seconds:secondsBetween(start.current,end),started_at:new Date(start.current).toISOString(),completed_at:new Date(end).toISOString(),answers:nextAnswers});api.completeLevel(student.id,5,nextScore);}celebrateCompletion();speakThai("ยอดเยี่ยม หนูซื้อของครบ 5 ข้อแล้ว");router.push("/student/complete");};
 return <div className="min-h-screen bg-purple-50 p-6 flex flex-col items-center"><HeaderNav title="Level 5: ร้านค้าชีวิตจริง" backUrl="/student/path"/><div className="w-full max-w-3xl bg-white rounded-3xl p-6 border-4 border-purple-400 shadow-xl text-center"><div className="font-bold text-slate-500">ข้อที่ {index+1} จาก {scenarios.length}</div><h2 className="my-4 text-2xl font-black text-purple-950">{prompt}</h2>{feedback&&<div role="status" className="mb-4 rounded-xl bg-amber-100 p-3 font-bold">{feedback}</div>}{phase==="shop"?<><h3 className="mb-4 text-xl font-bold">เลือกร้านให้ตรงกับโจทย์</h3><div className="grid grid-cols-2 gap-4">{SHOPS.map(s=><button key={s.name} onClick={()=>setShop(s.name)} className={`p-6 rounded-2xl border-4 font-black text-xl ${shop===s.name?"border-purple-600 bg-purple-100":"border-slate-200"}`}><span className="block text-6xl">{s.icon}</span>{s.name}</button>)}</div><button disabled={!shop} onClick={confirmShop} className="mt-5 w-full rounded-2xl bg-purple-600 py-4 text-xl font-black text-white disabled:bg-slate-300">ยืนยันร้าน</button></>:phase==="items"?<><h3 className="mb-4 text-xl font-bold">เลือกสินค้าใส่ตะกร้า</h3><div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{PRODUCTS.map(p=><button key={p.name} onClick={()=>setItems(v=>v.includes(p.name)?v.filter(x=>x!==p.name):[...v,p.name])} className={`p-3 rounded-xl border-4 ${items.includes(p.name)?"border-purple-600 bg-purple-100":"border-slate-200"}`}><span className="block text-4xl">{p.emoji}</span><b>{p.name}</b><span className="block">{p.price} บาท</span></button>)}</div><button disabled={items.length===0} onClick={confirmItems} className="mt-5 w-full rounded-2xl bg-purple-600 py-4 text-xl font-black text-white disabled:bg-slate-300">ยืนยันสินค้า</button></>:<><div className="mb-4 rounded-xl bg-slate-100 p-3 text-xl font-black">{formatMoneyEquation(quantities)}</div><MoneyQuantitySelector values={MONEY} quantities={quantities} onChange={setQuantities}/><button disabled={moneyTotal===0} onClick={pay} className="mt-5 w-full rounded-2xl bg-purple-600 py-5 text-2xl font-black text-white disabled:bg-slate-300">จ่ายเงิน</button></>}</div></div>;
}
