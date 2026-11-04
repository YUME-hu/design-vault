import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@design-vault/adapters/utils";

const badgeVariants = cva(
  "inline-flex items-center border px-2 py-[3px] font-mono text-[10px] uppercase leading-none tracking-[0.16em]",
  {
    variants: {
      variant: {
        outline: "border-hairline-strong bg-transparent text-charcoal",
        solid: "border-charcoal bg-charcoal text-paper",
        muted: "border-hairline bg-transparent text-ink-faded",
        signal: "border-signal bg-signal text-paper",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
