import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MoneyQuantitySelector } from "./MoneyQuantitySelector";

const { mockSpeakThai } = vi.hoisted(() => ({ mockSpeakThai: vi.fn() }));

vi.mock("@/lib/speech", () => ({
  speakThai: mockSpeakThai,
  playSoundEffect: vi.fn(),
}));

describe("MoneyQuantitySelector", () => {
  afterEach(cleanup);

  it("increments repeated money, announces it, and allows decrementing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <MoneyQuantitySelector values={[10, 20]} quantities={{}} onChange={onChange} />,
    );

    await user.click(screen.getByRole("button", { name: "เพิ่มเหรียญ 10 บาท" }));
    expect(onChange).toHaveBeenLastCalledWith({ 10: 1 });
    expect(mockSpeakThai).toHaveBeenLastCalledWith("เหรียญ 10 บาท");

    rerender(
      <MoneyQuantitySelector values={[10, 20]} quantities={{ 10: 2 }} onChange={onChange} />,
    );
    expect(screen.getByText("×2")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "ลดเหรียญ 10 บาท" }));
    expect(onChange).toHaveBeenLastCalledWith({ 10: 1 });
  });

  it("clears every selected denomination", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MoneyQuantitySelector
        values={[5, 10, 20]}
        quantities={{ 5: 2, 10: 1 }}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "ล้างเงิน" }));
    expect(onChange).toHaveBeenLastCalledWith({});
  });
});
