import * as React from "react";
import { cn } from "@design-vault/adapters/utils";

/** 白底 + 1px 炭黑边 + 左上/右下铆钉，卡片就是一块控制台面板。 */
export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("panel rivet", className)} {...props} />
  ),
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("border-b border-hairline px-5 py-4", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-5 py-4", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("border-t border-hairline px-5 py-3", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export function Separator({ className }: { className?: string }) {
  return <div role="separator" className={cn("h-px w-full bg-hairline", className)} />;
}
