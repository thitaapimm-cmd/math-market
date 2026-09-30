"use client";
import React from "react";
import Image from "next/image";
import { getMoneySpeech, type MoneyValue } from "@/lib/money";
import { speakThai } from "@/lib/speech";

interface MoneyCardProps {
  value: MoneyValue;
  ariaLabel?: string;
  selected?: boolean;
  onClick?: () => void;
  size?: "md" | "lg";
  speakOnClick?: boolean;
  disabled?: boolean;
}

export const MoneyCard: React.FC<MoneyCardProps> = ({
  value,
  ariaLabel,
  selected = false,
  onClick,
  size = "lg",
  speakOnClick = false,
  disabled = false,
}) => {
  const isCoin = value <= 10;

  const dims = isCoin
    ? size === "lg"
      ? "w-36 h-36"
      : "w-24 h-24"
    : size === "lg"
      ? "w-64 h-40"
      : "w-40 h-24";

  const imageAlt = `${isCoin ? "เหรียญ" : "ธนบัตร"} ${value} บาท`;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onClick?.();
        if (speakOnClick) speakThai(getMoneySpeech(value));
      }}
      aria-pressed={selected}
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 bg-white p-1 shadow-md transition-all active:scale-95 ${dims} ${
        selected
          ? " border-amber-500 ring-4 ring-amber-300 scale-105 shadow-xl"
          : " border-transparent hover:border-sky-300 hover:brightness-95"
      }`}
      aria-label={ariaLabel ?? `เงิน ${value} บาท`}>
      <Image
        src={`/money/${value}.png`}
        width={isCoin ? 380 : 520}
        height={isCoin ? 380 : 320}
        alt={imageAlt}
        className="h-full w-full object-contain"
      />
      <span className="sr-only">{value} บาท</span>
    </button>
  );
};
