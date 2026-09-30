import confetti from "canvas-confetti";

export const celebrateCorrect = () => {
  confetti({
    particleCount: 24,
    spread: 45,
    origin: { y: 0.65 },
    scalar: 0.8,
  });
};

export const celebrateCompletion = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
};
