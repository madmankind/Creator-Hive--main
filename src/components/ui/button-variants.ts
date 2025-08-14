import { cva } from "class-variance-authority";

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


