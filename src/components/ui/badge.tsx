import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "red" | "gold" | "outline" | "green" | "gray";

const variants: Record<Variant, string> = {
  red: "bg-brand-red text-white",
  gold: "bg-brand-gold text-brand-black",
  outline: "border border-brand-border text-brand-white",
  green: "bg-green-700 text-white",
  gray: "bg-white/10 text-brand-white",
};

export function Badge({
  className,
  variant = "outline",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
