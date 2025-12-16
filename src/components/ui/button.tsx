"use client";
import * as React from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap focus-visible:outline-none focus-ring disabled:opacity-60 disabled:cursor-not-allowed transition-colors",
  {
    variants: {
      variant: {
        gradient:
          "bg-brand-gradient text-black font-medium rounded-xl px-5 py-3 shadow-sm hover:opacity-95",
        outline:
          "rounded-xl px-5 py-3 border border-[color:var(--color-border)] text-foreground hover:bg-[color:var(--grey-900)]",
        ghost: "rounded-xl px-4 py-2 hover:bg-[color:var(--grey-800)]",
        pod: "bg-[#7C3AED] text-white shadow-[0_0_24px_rgba(124,58,237,0.45)] hover:bg-[#8B5CF6] hover:shadow-[0_0_32px_rgba(124,58,237,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]/70",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-base",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "gradient",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  }
);
Button.displayName = "Button";


