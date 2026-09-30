import confetti from "canvas-confetti";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { celebrateCompletion, celebrateCorrect } from "./celebration";

vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

describe("celebration", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses a restrained burst for a correct answer", () => {
    celebrateCorrect();

    expect(confetti).toHaveBeenCalledWith(
      expect.objectContaining({ particleCount: 24, spread: 45 }),
    );
  });

  it("uses a larger burst for completing a question set", () => {
    celebrateCompletion();

    expect(confetti).toHaveBeenCalledWith(
      expect.objectContaining({ particleCount: 100, spread: 70 }),
    );
  });
});
