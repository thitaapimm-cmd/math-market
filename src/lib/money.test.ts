import { describe, expect, it } from "vitest";
import {
  createMoneyItems,
  decrementMoney,
  expandMoneyQuantities,
  formatMoneyEquation,
  getMoneySpeech,
  getSelectedMoneyValues,
  incrementMoney,
  sumMoneyQuantities,
  sumSelectedMoney,
  toggleMoneyItem,
} from "./money";

describe("physical money selection", () => {
  it.each([
    [1, "เหรียญ 1 บาท"],
    [2, "เหรียญ 2 บาท"],
    [5, "เหรียญ 5 บาท"],
    [10, "เหรียญ 10 บาท"],
    [20, "ธนบัตร 20 บาท"],
    [50, "ธนบัตร 50 บาท"],
    [100, "ธนบัตร 100 บาท"],
  ] as const)("reads %i baht as Thai money", (value, spokenText) => {
    expect(getMoneySpeech(value)).toBe(spokenText);
  });

  it("keeps duplicate denominations as separate pieces of money", () => {
    const items = createMoneyItems([20, 20, 10], "tray");

    expect(items).toEqual([
      { id: "tray-0", value: 20 },
      { id: "tray-1", value: 20 },
      { id: "tray-2", value: 10 },
    ]);
  });

  it("selects, totals, and removes one physical item without affecting its duplicate", () => {
    const items = createMoneyItems([20, 20, 10], "tray");
    let selectedIds: string[] = [];

    selectedIds = toggleMoneyItem(selectedIds, items[0].id);
    expect(getSelectedMoneyValues(items, selectedIds)).toEqual([20]);
    expect(sumSelectedMoney(items, selectedIds)).toBe(20);

    selectedIds = toggleMoneyItem(selectedIds, items[1].id);
    expect(getSelectedMoneyValues(items, selectedIds)).toEqual([20, 20]);
    expect(sumSelectedMoney(items, selectedIds)).toBe(40);

    selectedIds = toggleMoneyItem(selectedIds, items[0].id);
    expect(getSelectedMoneyValues(items, selectedIds)).toEqual([20]);
    expect(selectedIds).toEqual(["tray-1"]);
  });
});

describe("money quantities", () => {
  it("supports repeated and mixed exact-payment combinations", () => {
    expect(sumMoneyQuantities({ 10: 3 })).toBe(30);
    expect(sumMoneyQuantities({ 20: 1, 10: 1 })).toBe(30);
    expect(sumMoneyQuantities({ 10: 2, 5: 2 })).toBe(30);
  });

  it("increments, decrements, and removes zero quantities immutably", () => {
    const original = { 10: 1 } as const;

    expect(incrementMoney(original, 10)).toEqual({ 10: 2 });
    expect(decrementMoney(original, 10)).toEqual({});
    expect(original).toEqual({ 10: 1 });
  });

  it("expands and formats quantities in ascending denomination order", () => {
    const quantities = { 10: 2, 5: 2 };

    expect(expandMoneyQuantities(quantities)).toEqual([5, 5, 10, 10]);
    expect(formatMoneyEquation(quantities)).toBe("5 × 2 + 10 × 2 = 30 บาท");
  });
});
