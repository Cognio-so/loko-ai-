import { motion } from "@/design-system/tokens";

export const animationPresets = {
  fadeIn: "opacity:0;animation:fadeIn var(--motion-slow) var(--ease-standard) forwards;",
  slideUp: "opacity:0;transform:translateY(18px);animation:slideUp var(--motion-slow) var(--ease-emphasized) forwards;",
  scaleIn: "opacity:0;transform:scale(.96);animation:scaleIn var(--motion-slow) var(--ease-emphasized) forwards;",
  hoverLift: "transition:transform var(--motion-base) var(--ease-standard),box-shadow var(--motion-base) var(--ease-standard);",
  hoverGlow: "transition:box-shadow var(--motion-base) var(--ease-standard),border-color var(--motion-base) var(--ease-standard);",
  pageTransition: "animation:fadeIn var(--motion-slow) var(--ease-standard) both;",
} as const;

export function buildMotionCss() {
  return `
    :root{--motion-fast:${motion.duration.fast};--motion-base:${motion.duration.base};--motion-slow:${motion.duration.slow};--ease-standard:${motion.easing.standard};--ease-emphasized:${motion.easing.emphasized}}
    @keyframes fadeIn{to{opacity:1}}
    @keyframes slideUp{to{opacity:1;transform:translateY(0)}}
    @keyframes scaleIn{to{opacity:1;transform:scale(1)}}
    .reveal{${animationPresets.slideUp}}
    .stagger-1{animation-delay:80ms}.stagger-2{animation-delay:160ms}.stagger-3{animation-delay:240ms}.stagger-4{animation-delay:320ms}
    .hover-lift{${animationPresets.hoverLift}} .hover-lift:hover{transform:${motion.hoverLift}}
    .hover-glow{${animationPresets.hoverGlow}} .hover-glow:hover{box-shadow:0 24px 70px rgba(14,165,233,.18)}
  `;
}
