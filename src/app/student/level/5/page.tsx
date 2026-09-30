"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HeaderNav } from "@/components/common/HeaderNav";
import { MoneyQuantitySelector } from "@/components/common/MoneyQuantitySelector";
import { celebrateCompletion, celebrateCorrect } from "@/lib/celebration";
import { nowMs, secondsBetween, shuffleQuestions } from "@/lib/learningSession";
import {
  expandMoneyQuantities,
  sumMoneyQuantities,
  type MoneyQuantities,
} from "@/lib/money";
import { playSoundEffect } from "@/lib/speech";
import { useLessonAudio } from "@/lib/useLessonAudio";
import { SpeechStatus } from "@/components/common/SpeechStatus";
import { api } from "@/lib/storage";
import type { AttemptAnswer, Product, Shop } from "@/types";
import { ProductImage } from "@/components/common/ProductImage";

const GUIDED_BLUEPRINTS = [
  { id: "l5-1", shopId: "shop_rom", productIds: ["rom_fried_noodles"] },
  { id: "l5-2", shopId: "shop_coop", productIds: ["coop_oreo"] },
  { id: "l5-3", shopId: "shop_rom", productIds: ["rom_fried_chicken", "rom_thai_tea"] },
  { id: "l5-4", shopId: "shop_coop", productIds: ["coop_pocky", "coop_cookie"] },
] as const;

const MONEY_VALUES = [5, 10, 20, 50, 100] as const;
const TOTAL_ROUNDS = 5;
const EMPTY_PRODUCTS: Product[] = [];

type Phase = "shop" | "items" | "pay";
type GuidedScenario = {
  id: string;
  shop: Shop;
  products: Product[];
};

const buildGuidedScenarios = (
  shops: Shop[],
  products: Product[],
): GuidedScenario[] =>
  GUIDED_BLUEPRINTS.flatMap((blueprint) => {
    const shop = shops.find(
      (candidate) => candidate.id === blueprint.shopId && candidate.active,
    );
    const selectedProducts = blueprint.productIds
      .map((id) => products.find((product) => product.id === id && product.active))
      .filter((product): product is Product => Boolean(product));

    if (!shop || selectedProducts.length !== blueprint.productIds.length) return [];
    return [{ id: blueprint.id, shop, products: selectedProducts }];
  });

export default function Level5Page() {
  const router = useRouter();
  const [shops] = useState(() => api.getShops().filter((shop) => shop.active));
  const [products] = useState(() =>
    api.getProducts().filter((product) => product.active),
  );
  const [scenarios, setScenarios] = useState<GuidedScenario[]>(() =>
    buildGuidedScenarios(api.getShops(), api.getProducts()),
  );
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("shop");
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<MoneyQuantities>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [score, setScore] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [mounted, setMounted] = useState(false);
  const sessionStartedAt = useRef(0);
  const roundStartedAt = useRef(0);
  const answers = useRef<AttemptAnswer[]>([]);
  const student = useMemo(
    () => (mounted ? api.getCurrentStudent() : null),
    [mounted],
  );

  useEffect(() => {
    queueMicrotask(() => {
      setScenarios(
        shuffleQuestions(buildGuidedScenarios(api.getShops(), api.getProducts())),
      );
      sessionStartedAt.current = nowMs();
      roundStartedAt.current = nowMs();
      setMounted(true);
    });
  }, []);

  const isFreeRound = index === scenarios.length;
  const scenario = isFreeRound ? null : scenarios[index];
  const selectedShop = shops.find((shop) => shop.id === selectedShopId) ?? null;
  const shopProducts = selectedShop
    ? products.filter((product) => product.shop_ids.includes(selectedShop.id))
    : [];
  const selectedProducts = products.filter((product) =>
    selectedProductIds.includes(product.id),
  );
  const guidedProducts = scenario?.products ?? EMPTY_PRODUCTS;
  const targetProducts = isFreeRound ? selectedProducts : guidedProducts;
  const totalPrice = targetProducts.reduce((total, product) => total + product.price, 0);
  const moneyTotal = sumMoneyQuantities(quantities);
  const guidedPrompt = scenario
    ? `ไป${scenario.shop.name} แล้วเลือก${scenario.products
        .map((product) => product.name)
        .join(" และ ")} ราคา ${totalPrice} บาท`
    : "";
  const visiblePrompt = isFreeRound
    ? "หนูเลือกร้านและสินค้าที่อยากซื้อเองได้เลย"
    : guidedPrompt;

  useEffect(() => {
    if (mounted && !student) router.push("/");
  }, [mounted, router, student]);

  useEffect(() => {
    if (mounted && student) roundStartedAt.current = nowMs();
  }, [index, mounted, student]);

  const phasePrompt = phase === "shop" ? visiblePrompt : phase === "items"
    ? isFreeRound ? "เลือกสินค้าที่อยากซื้อใส่ตะกร้า"
      : `เลือก${guidedProducts.map((product) => product.name).join(" และ ")} ใส่ตะกร้า`
    : `ยอด ${totalPrice} บาท เลือกเงินให้พอดี`;
  const audio = useLessonAudio(phasePrompt, `${index}-${phase}`, mounted && Boolean(student));

  const showWrongAnswer = (hint: string) => {
    playSoundEffect("wrong");
    setWrongCount((count) => count + 1);
    setFeedback(hint);
    void audio.say(hint);
  };

  const chooseShop = (shopId: string) => {
    if (isChecking || audio.isBusy()) return;
    playSoundEffect("click");
    if (selectedShopId !== shopId) setSelectedProductIds([]);
    setSelectedShopId(shopId);
    setFeedback(null);
  };

  const confirmShop = () => {
    if (!selectedShopId || isChecking || audio.isBusy()) return;
    if (!isFreeRound && selectedShopId !== scenario?.shop.id) {
      showWrongAnswer(`คำใบ้: โจทย์บอกให้ไป${scenario?.shop.name}`);
      return;
    }
    playSoundEffect("correct");
    setFeedback(null);
    setPhase("items");
  };

  const toggleProduct = (productId: string) => {
    if (isChecking || audio.isBusy()) return;
    playSoundEffect("click");
    setFeedback(null);
    setSelectedProductIds((selected) =>
      selected.includes(productId)
        ? selected.filter((id) => id !== productId)
        : [...selected, productId],
    );
  };

  const confirmProducts = () => {
    if (selectedProductIds.length === 0 || isChecking || audio.isBusy()) return;
    if (!isFreeRound) {
      const expected = guidedProducts.map((product) => product.id).sort().join("|");
      const actual = [...selectedProductIds].sort().join("|");
      if (actual !== expected) {
        showWrongAnswer(
          `คำใบ้: เลือก${guidedProducts.map((product) => product.name).join(" และ ")}ให้ครบ`,
        );
        return;
      }
    }
    playSoundEffect("correct");
    setFeedback(null);
    setPhase("pay");
  };

  const finishLevel = (finalScore: number, finalAnswers: AttemptAnswer[]) => {
    const completedAt = nowMs();
    if (student) {
      api.recordAttempt({
        student_id: student.id,
        level: 5,
        activity_type: "hybrid_shopping",
        mode: "learning",
        score: finalScore,
        total_questions: TOTAL_ROUNDS,
        hint_count: finalAnswers.filter((answer) => answer.hint_used).length,
        wrong_count: finalAnswers.reduce(
          (total, answer) => total + (answer.wrong_count ?? 0),
          0,
        ),
        duration_seconds: secondsBetween(sessionStartedAt.current, completedAt),
        started_at: new Date(sessionStartedAt.current).toISOString(),
        completed_at: new Date(completedAt).toISOString(),
        answers: finalAnswers,
      });
      api.completeLevel(student.id, 5, finalScore);
    }
    celebrateCompletion();
    void audio.say("ยอดเยี่ยม หนูซื้อของครบ 5 ข้อแล้ว").then((result) => { if (result !== "cancelled") router.push("/student/complete"); });
  };

  const advance = (nextScore: number, nextAnswers: AttemptAnswer[]) => {
    if (index + 1 >= TOTAL_ROUNDS) {
      finishLevel(nextScore, nextAnswers);
      return;
    }
    setSelectedShopId(null);
    setSelectedProductIds([]);
    setQuantities({});
    setFeedback(null);
    setWrongCount(0);
    setIsChecking(false);
    setPhase("shop");

    if (index + 1 < TOTAL_ROUNDS) {
      setIndex((current) => current + 1);
      return;
    }
    finishLevel(nextScore, nextAnswers);
  };

  const pay = () => {
    if (isChecking || audio.isBusy() || moneyTotal === 0 || totalPrice === 0) return;
    if (moneyTotal !== totalPrice) {
      showWrongAnswer(`เลือกเงินให้ครบ ${totalPrice} บาทพอดีนะ`);
      return;
    }

    const firstTryCorrect = wrongCount === 0;
    const nextScore = firstTryCorrect ? score + 1 : score;
    const actualPrompt = isFreeRound
      ? `เลือกซื้อเองที่${selectedShop?.name}: ${selectedProducts
          .map((product) => product.name)
          .join(" และ ")} รวม ${totalPrice} บาท`
      : guidedPrompt;
    const nextAnswers: AttemptAnswer[] = [
      ...answers.current,
      {
        question_id: isFreeRound ? "l5-free" : scenario?.id ?? `l5-${index + 1}`,
        prompt: actualPrompt,
        answer: expandMoneyQuantities(quantities),
        correct: true,
        first_try_correct: firstTryCorrect,
        hint_used: wrongCount > 0,
        wrong_count: wrongCount,
        duration_seconds: secondsBetween(roundStartedAt.current, nowMs()),
        steps: [
          {
            name: isFreeRound ? "free_shopping" : "guided_shopping",
            answer: `${selectedShop?.name}: ${targetProducts
              .map((product) => product.name)
              .join(" และ ")} = ${totalPrice} บาท`,
            correct: true,
            wrong_count: wrongCount,
            duration_seconds: secondsBetween(roundStartedAt.current, nowMs()),
          },
        ],
      },
    ];
    answers.current = nextAnswers;
    setScore(nextScore);
    setIsChecking(true);
    playSoundEffect("correct");
    celebrateCorrect();
    setFeedback("ถูกต้อง ซื้อของสำเร็จ!");
    void audio.say("ถูกต้อง ซื้อของสำเร็จ").then((result) => { if (result !== "cancelled") advance(nextScore, nextAnswers); });
  };

  if (!scenario && !isFreeRound) return null;

  return (
    <div className="min-h-screen bg-purple-50 p-6 flex flex-col items-center">
      <HeaderNav title="Level 5: ร้านค้าชีวิตจริง" backUrl="/student/path" />
      <main className={`w-full max-w-6xl rounded-3xl border-4 border-purple-400 bg-white p-5 text-center shadow-xl ${phase === "pay" ? "lg:p-4" : "sm:p-6"}`}>
        <SpeechStatus locked={audio.locked} unavailable={audio.audioUnavailable} onReplay={audio.replay} />
        <div className="font-bold text-slate-500">
          ข้อที่ {index + 1} จาก {TOTAL_ROUNDS}
        </div>
        {isFreeRound && (
          <div className="mx-auto mt-3 w-fit rounded-full bg-fuchsia-100 px-5 py-2 font-black text-fuchsia-800">
            รอบเลือกซื้อเอง
          </div>
        )}
        <h2 className={`${phase === "pay" ? "my-2" : "my-4"} text-2xl font-black text-purple-950`}>
          {visiblePrompt}
        </h2>

        {feedback && (
          <div role="status" className="mb-4 rounded-xl bg-amber-100 p-3 font-bold">
            {feedback}
          </div>
        )}

        {phase === "shop" ? (
          <>
            <h3 className="mb-4 text-xl font-bold">
              {isFreeRound ? "เลือกร้านที่หนูอยากไป" : "เลือกร้านให้ตรงกับโจทย์"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {shops.map((shopOption) => {
                const selected = selectedShopId === shopOption.id;
                return (
                  <button
                    key={shopOption.id}
                    type="button"
                    aria-label={`เลือกร้าน ${shopOption.name}`}
                    disabled={audio.locked || isChecking}
                    aria-pressed={selected}
                    onClick={() => chooseShop(shopOption.id)}
                    className={`rounded-2xl border-4 p-6 text-xl font-black transition-all ${
                      selected
                        ? "border-purple-700 bg-purple-600 text-white shadow-xl ring-4 ring-purple-200"
                        : "border-slate-200 hover:border-purple-300"
                    }`}
                  >
                    <span aria-hidden="true" className="block text-6xl">
                      {shopOption.image_url}
                    </span>
                    {shopOption.name}
                    {selected && <span className="mt-1 block text-sm">✓ เลือกแล้ว</span>}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              disabled={!selectedShopId || audio.locked || isChecking}
              onClick={confirmShop}
              className="mt-5 w-full rounded-2xl bg-purple-600 py-4 text-xl font-black text-white disabled:bg-slate-300"
            >
              ยืนยันร้าน
            </button>
          </>
        ) : phase === "items" ? (
          <>
            <h3 className="mb-4 text-xl font-bold">เลือกสินค้าใส่ตะกร้า</h3>
            {isFreeRound && (
              <div className="mb-4 flex items-center justify-between rounded-2xl bg-purple-50 p-3 text-left font-bold text-purple-900">
                <span>ร้านที่เลือก: {selectedShop?.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (audio.isBusy()) return;
                    setSelectedShopId(null);
                    setSelectedProductIds([]);
                    setPhase("shop");
                  }}
                  disabled={audio.locked || isChecking}
                  className="rounded-xl border-2 border-purple-300 bg-white px-3 py-2"
                >
                  เปลี่ยนร้าน
                </button>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {shopProducts.map((product) => {
                const selected = selectedProductIds.includes(product.id);
                return (
                  <button
                    key={product.id}
                    type="button"
                    aria-label={`เลือกสินค้า ${product.name} ราคา ${product.price} บาท`}
                    disabled={audio.locked || isChecking}
                    aria-pressed={selected}
                    onClick={() => toggleProduct(product.id)}
                    className={`rounded-xl border-4 p-3 transition-all ${
                      selected
                        ? "border-purple-700 bg-purple-600 text-white ring-4 ring-purple-200"
                        : "border-slate-200 hover:border-purple-300"
                    }`}
                  >
                    <ProductImage product={product} size={80} />
                    <b>{product.name}</b>
                    <span className="block">{product.price} บาท</span>
                    {selected && <span className="block text-xs font-bold">✓ ในตะกร้า</span>}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              disabled={selectedProductIds.length === 0 || audio.locked || isChecking}
              onClick={confirmProducts}
              className="mt-5 w-full rounded-2xl bg-purple-600 py-4 text-xl font-black text-white disabled:bg-slate-300"
            >
              ยืนยันสินค้า
            </button>
          </>
        ) : (
          <>
            <div className="mb-2 rounded-2xl bg-purple-50 px-4 py-2">
              <div className="text-lg font-bold text-purple-700">
                ยอดที่ต้องจ่าย {totalPrice} บาท
              </div>
            </div>
            <MoneyQuantitySelector
              values={MONEY_VALUES}
              quantities={quantities}
              showSelectedTray
              onChange={(next) => {
                setQuantities(next);
                setFeedback(null);
              }}
              disabled={isChecking || audio.locked}
            />
            <button
              type="button"
              disabled={moneyTotal === 0 || isChecking || audio.locked}
              onClick={pay}
              className="mt-5 w-full rounded-2xl bg-purple-600 py-5 text-2xl font-black text-white disabled:bg-slate-300"
            >
              จ่ายเงิน
            </button>
          </>
        )}
      </main>
    </div>
  );
}
