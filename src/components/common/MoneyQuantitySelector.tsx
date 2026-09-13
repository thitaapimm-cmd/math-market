"use client";

import { Minus, RotateCcw } from "lucide-react";
import { MoneyCard } from "@/components/common/MoneyCard";
import {
  decrementMoney,
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
}

export function MoneyQuantitySelector({
  values,
  quantities,
  onChange,
  disabled = false,
}: MoneyQuantitySelectorProps) {
  const hasSelection = values.some((value) => (quantities[value] ?? 0) > 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-center gap-4">
        {values.map((value) => {
          const quantity = quantities[value] ?? 0;
          const moneyName = getMoneySpeech(value);
          return (
            <div key={value} className="relative pb-5">
              <MoneyCard
                value={value}
                size="md"
                selected={quantity > 0}
                ariaLabel={`เพิ่ม${moneyName}`}
                onClick={() => {
                  if (disabled) return;
                  playSoundEffect("click");
                  speakThai(moneyName);
                  onChange(incrementMoney(quantities, value));
                }}
              />
              {quantity > 0 && (
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
