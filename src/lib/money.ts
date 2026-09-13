export const SUPPORTED_MONEY_VALUES = [1, 2, 5, 10, 20, 50, 100] as const;

export type MoneyValue = (typeof SUPPORTED_MONEY_VALUES)[number];

export interface MoneyItem {
  id: string;
  value: MoneyValue;
}

export type MoneyQuantities = Partial<Record<MoneyValue, number>>;

export function getMoneySpeech(value: MoneyValue): string {
  return `${value <= 10 ? "เหรียญ" : "ธนบัตร"} ${value} บาท`;
}

export function createMoneyItems(
  values: readonly MoneyValue[],
  prefix: string,
): MoneyItem[] {
  return values.map((value, index) => ({ id: `${prefix}-${index}`, value }));
}

export function toggleMoneyItem(selectedIds: string[], id: string): string[] {
  return selectedIds.includes(id)
    ? selectedIds.filter((selectedId) => selectedId !== id)
    : [...selectedIds, id];
}

export function getSelectedMoneyValues(
  items: readonly MoneyItem[],
  selectedIds: readonly string[],
): MoneyValue[] {
  const selected = new Set(selectedIds);
  return items.filter((item) => selected.has(item.id)).map((item) => item.value);
}

export function sumSelectedMoney(
  items: readonly MoneyItem[],
  selectedIds: readonly string[],
): number {
  return getSelectedMoneyValues(items, selectedIds).reduce(
    (total, value) => total + value,
    0,
  );
}

export function incrementMoney(
  current: MoneyQuantities,
  value: MoneyValue,
): MoneyQuantities {
  return { ...current, [value]: (current[value] ?? 0) + 1 };
}

export function decrementMoney(
  current: MoneyQuantities,
  value: MoneyValue,
): MoneyQuantities {
  const next = { ...current };
  const quantity = next[value] ?? 0;
  if (quantity <= 1) delete next[value];
  else next[value] = quantity - 1;
  return next;
}

export function expandMoneyQuantities(
  quantities: MoneyQuantities,
): MoneyValue[] {
  return SUPPORTED_MONEY_VALUES.flatMap((value) =>
    Array.from({ length: quantities[value] ?? 0 }, () => value),
  );
}

export function sumMoneyQuantities(quantities: MoneyQuantities): number {
  return expandMoneyQuantities(quantities).reduce(
    (total, value) => total + value,
    0,
  );
}

export function formatMoneyEquation(quantities: MoneyQuantities): string {
  const parts = SUPPORTED_MONEY_VALUES.flatMap((value) => {
    const quantity = quantities[value] ?? 0;
    if (quantity === 0) return [];
    return [quantity === 1 ? `${value}` : `${value} × ${quantity}`];
  });
  const total = sumMoneyQuantities(quantities);
  return parts.length === 0 ? "0 บาท" : `${parts.join(" + ")} = ${total} บาท`;
}
