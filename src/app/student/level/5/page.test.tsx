import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Level5Page from "./page";

const { mockSpeakThai } = vi.hoisted(() => ({ mockSpeakThai: vi.fn() }));
vi.mock("next/navigation",()=>({useRouter:()=>({push:vi.fn()})}));
vi.mock("@/lib/storage",()=>({api:{getCurrentStudent:()=>({id:"s1",name:"เด็ก"}),getShops:()=>[],getProducts:()=>[],recordAttempt:vi.fn(),completeLevel:vi.fn()}}));
vi.mock("@/lib/speech",()=>({speakThai:mockSpeakThai,playSoundEffect:vi.fn()}));
vi.mock("@/lib/celebration",()=>({celebrateCompletion:vi.fn(),celebrateCorrect:vi.fn()}));

describe("Level 5 guided scenarios",()=>{
  afterEach(()=>{cleanup();vi.restoreAllMocks();});
  beforeEach(()=>{vi.clearAllMocks();vi.spyOn(Math,"random").mockReturnValue(.999);});
  it("starts a five-scenario session and reads its first instruction",async()=>{
    render(<Level5Page/>);
    expect(await screen.findByText("ข้อที่ 1 จาก 5")).toBeInTheDocument();
    await waitFor(()=>expect(mockSpeakThai).toHaveBeenCalledWith("ไปร้านค้าป้ารม แล้วเลือกขนมปัง ราคา 10 บาท"));
    expect(screen.getByText("เลือกร้านให้ตรงกับโจทย์")).toBeInTheDocument();
  });
});
