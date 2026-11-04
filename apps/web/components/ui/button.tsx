import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@design-vault/adapters/utils";

/**
 * shadcn/ui 的 Button，但换成了 NASA-Punk 的物理规格：
 * 直角、1px 炭黑边、无 transition（Hover 直接黑白反转，不做光效）。
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap border font-mono text-[11px] uppercase leading-none tracking-[0.18em] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
  {
    variants: {
      variant: {
        default:
          "border-charcoal bg-transparent text-charcoal hover:bg-charcoal hover:text-paper",
        solid: "border-charcoal bg-charcoal text-paper hover:border-signal hover:bg-signal",
        outline:
          "border-hairline-strong bg-transparent text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-paper",
        ghost:
          "border-transparent bg-transparent text-ink-faded hover:border-charcoal hover:text-charcoal",
        signal: "border-signal bg-signal text-paper hover:bg-charcoal hover:border-charcoal",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-[10px]",
        lg: "h-12 px-6 text-[12px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
