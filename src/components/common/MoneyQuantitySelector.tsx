"use client";

import Image from "next/image";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { MoneyCard } from "@/components/common/MoneyCard";
import {
  decrementMoney,
  formatExpandedMoneyEquation,
  getMoneySpeech,
  incrementMoney,
  type MoneyQuantities,
  type MoneyValue,
} from "@/lib/money";
import { playSoundEffect, speakThai } from "@/lib/speech";

interface MoneyQuantitySelectorProps {
  values: readonly MoneyValue[];
  quantities: MoneyQuantities;
  onChange: (quantities: MoneyQuantities) => void;
  disabled?: boolean;
  showSelectedTray?: boolean;
}

export function MoneyQuantitySelector({
  values,
  quantities,
  onChange,
  disabled = false,
  showSelectedTray = false,
}: MoneyQuantitySelectorProps) {
  const hasSelection = values.some((value) => (quantities[value] ?? 0) > 0);
  const selectedCoins = values.filter(
    (value) => value <= 10 && (quantities[value] ?? 0) > 0,
  );
  const selectedNotes = values.filter(
    (value) => value > 10 && (quantities[value] ?? 0) > 0,
  );

  const renderSelectedGroup = (
    label: string,
    selectedValues: readonly MoneyValue[],
  ) => (
    <section className="min-w-0 flex-1 rounded-2xl border-2 border-slate-200 bg-white p-3">
      <div className="mb-3 rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-600">
        {label}
      </div>
      {selectedValues.length === 0 ? (
        <div className="flex min-h-20 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-400">
          ยังไม่ได้เลือก
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {selectedValues.map((value) => {
            const quantity = quantities[value] ?? 0;
            const moneyName = getMoneySpeech(value);
            return (
              <div key={value} className="min-w-0 rounded-xl bg-amber-50 p-1">
                <div className="flex h-12 items-center justify-center overflow-x-auto px-1">
                  {Array.from({ length: quantity }, (_, index) => (
                    <Image
                      key={`${value}-${index}`}
                      src={`/money/${value}.png`}
                      width={value <= 10 ? 64 : 112}
                      height={value <= 10 ? 64 : 68}
                      alt={`${moneyName} ใบที่ ${index + 1}`}
                      className={`${value <= 10 ? "h-11 w-11" : "h-12 w-20"} shrink-0 object-contain ${index > 0 ? "-ml-2" : ""}`}
                    />
                  ))}
                </div>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={disabled}
                    aria-label={`ลด${moneyName}`}
                    onClick={() => {
                      playSoundEffect("click");
                      onChange(decrementMoney(quantities, value));
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700 shadow-sm hover:bg-slate-300 disabled:opacity-50"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="min-w-5 text-lg font-black text-slate-800">{quantity}</span>
                  <button
                    type="button"
                    disabled={disabled}
                    aria-label={`เพิ่ม${moneyName}จากเงินที่เลือก`}
                    onClick={() => {
                      playSoundEffect("click");
                      speakThai(moneyName);
                      onChange(incrementMoney(quantities, value));
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-sm hover:bg-amber-500 disabled:opacity-50"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );

  return (
    <div className="space-y-4">
      {showSelectedTray && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/60 p-3 sm:p-4">
          <div className="mb-3 font-black text-slate-700">เงินที่หนูเลือก</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {renderSelectedGroup("เหรียญ", selectedCoins)}
            {renderSelectedGroup("ธนบัตร", selectedNotes)}
          </div>
          <div
            aria-live="polite"
            className="mt-3 rounded-xl bg-slate-800 px-4 py-3 text-xl font-black text-white"
          >
            {formatExpandedMoneyEquation(quantities)}
          </div>
        </div>
      )}
      <div className="flex flex-wrap justify-center gap-4">
        {values.map((value) => {
          const quantity = quantities[value] ?? 0;
          const moneyName = getMoneySpeech(value);
          return (
            <div key={value} className="relative pb-5">
              <MoneyCard
                value={value}
                size="md"
                disabled={disabled}
                selected={quantity > 0}
                ariaLabel={`เพิ่ม${moneyName}`}
                onClick={() => {
                  if (disabled) return;
                  playSoundEffect("click");
                  speakThai(moneyName);
                  onChange(incrementMoney(quantities, value));
                }}
              />
              {quantity > 0 && !showSelectedTray && (
                <>
                  <span className="absolute -right-2 -top-2 rounded-full bg-amber-500 px-3 py-1 text-lg font-black text-amber-950 shadow">
                    ×{quantity}
                  </span>
                  <button
                    type="button"
                    disabled={disabled}
                    aria-label={`ลด${moneyName}`}
                    onClick={() => {
                      playSoundEffect("click");
                      onChange(decrementMoney(quantities, value));
                    }}
                    className="absolute bottom-0 left-1/2 flex h-9 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-slate-200 text-slate-700 shadow hover:bg-slate-300 disabled:opacity-50"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
      {hasSelection && (
        <button
          type="button"
          disabled={disabled}
          aria-label="ล้างเงิน"
          onClick={() => {
            playSoundEffect("click");
            onChange({});
          }}
          className="mx-auto flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-300 disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" /> ล้างเงิน
        </button>
      )}
    </div>
  );
}
