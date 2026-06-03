import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400/40",
  {
    variants: {
      variant: {
        default: "border-transparent bg-slate-950 text-white dark:bg-white dark:text-slate-950",
        secondary: "border-transparent bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200",
        outline: "border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200",
        premium: "border-sky-200 bg-sky-50 text-sky-700 shadow-sm shadow-sky-500/10 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
