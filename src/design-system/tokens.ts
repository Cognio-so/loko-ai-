import { colors } from "./colors";
import { motion } from "./motion";
import { radius } from "./radius";
import { shadows } from "./shadows";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const designTokens = {
  colors,
  spacing,
  typography,
  radius,
  shadows,
  motion,
} as const;

export type DesignTokens = typeof designTokens;

export { colors, spacing, typography, radius, shadows, motion };
