import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Level5Page from "./page";

const { mockRecordAttempt, mockSpeakThai, mockRouterPush } = vi.hoisted(() => ({
  mockRecordAttempt: vi.fn(),
  mockSpeakThai: vi.fn(),
  mockRouterPush: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockRouterPush }) }));
vi.mock("@/lib/storage", () => ({
  api: {
    getCurrentStudent: () => ({ id: "s1", name: "เด็ก" }),
    getShops: () => [
      { id: "shop_rom", name: "ร้านค้าป้ารม", description: "", image_url: "🏪", active: true },
      { id: "shop_coop", name: "สหกรณ์โรงเรียน", description: "", image_url: "🏫", active: true },
    ],
    getProducts: () => [
      { id: "rom_fried_noodles", name: "ผัดมาม่า", price: 15, emoji: "🍜", active: true, shop_ids: ["shop_rom"] },
      { id: "rom_fried_chicken", name: "ไก่ทอด", price: 10, emoji: "🍗", active: true, shop_ids: ["shop_rom"] },
      { id: "rom_thai_tea", name: "ชาไทย", price: 10, emoji: "🧋", active: true, shop_ids: ["shop_rom"] },
      { id: "coop_oreo", name: "โอรีโอ้", price: 5, emoji: "🍪", active: true, shop_ids: ["shop_coop"] },
      { id: "coop_pocky", name: "ป๊อกกี้", price: 20, emoji: "🍫", active: true, shop_ids: ["shop_coop"] },
      { id: "coop_cookie", name: "คุกกี้", price: 5, emoji: "🍪", active: true, shop_ids: ["shop_coop"] },
    ],
    recordAttempt: mockRecordAttempt,
    completeLevel: vi.fn(),
  },
}));
vi.mock("@/lib/speech", () => ({ speakThai: mockSpeakThai, playSoundEffect: vi.fn() }));
const { promptMarker } = vi.hoisted(() => ({ promptMarker: { current: "" } }));
vi.mock("@/lib/useLessonAudio", () => ({
  useLessonAudio: (prompt: string, key: string, enabled: boolean) => {
    if (enabled && promptMarker.current !== key) {
      promptMarker.current = key;
      mockSpeakThai(prompt);
    }
    return {
      locked: false, audioUnavailable: false, isBusy: () => false,
      replay: () => mockSpeakThai(prompt),
      say: (text: string) => { mockSpeakThai(text); return Promise.resolve("ended"); },
    };
  },
}));
vi.mock("@/lib/celebration", () => ({ celebrateCompletion: vi.fn(), celebrateCorrect: vi.fn() }));

const completeRound = async (shop: string, products: string[], paymentClicks: number[]) => {
  fireEvent.click(screen.getByRole("button", { name: `เลือกร้าน ${shop}` }));
  fireEvent.click(screen.getByRole("button", { name: "ยืนยันร้าน" }));
  for (const product of products) {
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`เลือกสินค้า ${product}`) }));
  }
  fireEvent.click(screen.getByRole("button", { name: "ยืนยันสินค้า" }));
  for (const value of paymentClicks) {
    const kind = value <= 10 ? "เหรียญ" : "ธนบัตร";
    fireEvent.click(screen.getByRole("button", { name: `เพิ่ม${kind} ${value} บาท` }));
  }
  fireEvent.click(screen.getByRole("button", { name: "จ่ายเงิน" }));
  await act(async () => vi.advanceTimersByTime(1400));
};

describe("Level 5 hybrid shopping", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    promptMarker.current = "";
    vi.spyOn(Math, "random").mockReturnValue(0.999);
  });

  it("starts with four shuffled guided scenarios from storage-backed shops and products", async () => {
    render(<Level5Page />);

    expect(await screen.findByText("ข้อที่ 1 จาก 5")).toBeInTheDocument();
    await waitFor(() =>
      expect(mockSpeakThai).toHaveBeenCalledWith(
        "ไปร้านค้าป้ารม แล้วเลือกผัดมาม่า ราคา 15 บาท",
      ),
    );
    expect(screen.getByText("เลือกร้านให้ตรงกับโจทย์")).toBeInTheDocument();
  });

  it("uses round five as free shopping and records the child's actual choices", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<Level5Page />);
    await act(async () => undefined);

    await completeRound("ร้านค้าป้ารม", ["ผัดมาม่า"], [10, 5]);
    await completeRound("สหกรณ์โรงเรียน", ["โอรีโอ้"], [5]);
    await completeRound("ร้านค้าป้ารม", ["ไก่ทอด", "ชาไทย"], [20]);
    await completeRound("สหกรณ์โรงเรียน", ["ป๊อกกี้", "คุกกี้"], [20, 5]);

    expect(screen.getByText("รอบเลือกซื้อเอง")).toBeInTheDocument();
    expect(screen.getByText("หนูเลือกร้านและสินค้าที่อยากซื้อเองได้เลย")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "เลือกร้าน สหกรณ์โรงเรียน" }));
    fireEvent.click(screen.getByRole("button", { name: "ยืนยันร้าน" }));
    expect(screen.queryByText("ผัดมาม่า")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /เลือกสินค้า โอรีโอ้/ }));
    fireEvent.click(screen.getByRole("button", { name: "ยืนยันสินค้า" }));
    expect(screen.getByText("ยอดที่ต้องจ่าย 5 บาท")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "เพิ่มเหรียญ 5 บาท" }));
    expect(screen.getByText("5 = 5 บาท")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "จ่ายเงิน" }));
    await act(async () => vi.advanceTimersByTime(1400));

    expect(mockRecordAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        activity_type: "hybrid_shopping",
        total_questions: 5,
        answers: expect.arrayContaining([
          expect.objectContaining({
            question_id: "l5-free",
            prompt: expect.stringContaining("สหกรณ์โรงเรียน"),
            steps: expect.arrayContaining([
              expect.objectContaining({ name: "free_shopping" }),
            ]),
          }),
        ]),
      }),
    );
    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith("/student/complete"));
  });

  it("exposes the selected shop clearly", async () => {
    const user = userEvent.setup();
    render(<Level5Page />);

    const rom = await screen.findByRole("button", { name: "เลือกร้าน ร้านค้าป้ารม" });
    await user.click(rom);
    expect(rom).toHaveAttribute("aria-pressed", "true");
  });
});
