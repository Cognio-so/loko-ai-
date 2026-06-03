export const motion = {
  duration: {
    fast: "160ms",
    base: "220ms",
    slow: "420ms",
  },
  easing: {
    standard: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    emphasized: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
  hoverLift: "translateY(-4px)",
  hoverScale: "scale(1.02)",
} as const;
