import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MoneyCard } from "./MoneyCard";

const { mockSpeakThai } = vi.hoisted(() => ({ mockSpeakThai: vi.fn() }));

vi.mock("@/lib/speech", () => ({ speakThai: mockSpeakThai }));

describe("MoneyCard", () => {
  afterEach(cleanup);

  it.each([1, 2, 5, 10] as const)(
    "renders the provided %i baht coin image",
    (value) => {
      render(<MoneyCard value={value} />);

      const image = screen.getByRole("img", { name: `เหรียญ ${value} บาท` });
      expect(decodeURIComponent(image.getAttribute("src") ?? "")).toContain(
        `/money/${value}.png`,
      );
    },
  );

  it.each([20, 50, 100] as const)(
    "renders the provided %i baht banknote image",
    (value) => {
      render(<MoneyCard value={value} />);

      const image = screen.getByRole("img", {
        name: `ธนบัตร ${value} บาท`,
      });
      expect(decodeURIComponent(image.getAttribute("src") ?? "")).toContain(
        `/money/${value}.png`,
      );
    },
  );

  it("exposes the selected state on the exact pressed item", () => {
    render(<MoneyCard value={20} selected />);

    expect(screen.getByRole("button", { name: "เงิน 20 บาท" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("reads the Thai denomination when an announceable money image is pressed", async () => {
    const user = userEvent.setup();
    render(<MoneyCard value={5} speakOnClick />);

    await user.click(screen.getByRole("button", { name: "เงิน 5 บาท" }));

    expect(mockSpeakThai).toHaveBeenCalledWith("เหรียญ 5 บาท");
  });
});
