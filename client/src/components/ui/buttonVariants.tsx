import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-220 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_8px_18px_rgba(79,70,229,0.25)] hover:bg-primary/90 hover:shadow-[0_14px_26px_rgba(79,70,229,0.34)]",
        destructive:
          "bg-destructive text-white shadow-[0_8px_18px_rgba(239,68,68,0.22)] hover:bg-destructive/90 hover:shadow-[0_14px_26px_rgba(239,68,68,0.3)] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-slate-300/90 bg-white/92 text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_6px_14px_rgba(15,23,42,0.08)] hover:bg-accent hover:text-accent-foreground hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_12px_24px_rgba(99,102,241,0.16)] dark:bg-input/30 dark:border-input dark:text-slate-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_20px_rgba(2,6,23,0.32)] dark:hover:bg-input/50 dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_14px_28px_rgba(30,41,59,0.42)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_6px_14px_rgba(15,23,42,0.1)] hover:bg-secondary/80 hover:shadow-[0_12px_22px_rgba(15,23,42,0.16)]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground hover:shadow-[0_8px_18px_rgba(15,23,42,0.1)] dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2.5 has-[>svg]:px-3.5",
        sm: "h-11 gap-1.5 px-3.5 has-[>svg]:px-3",
        lg: "h-12 px-6 has-[>svg]:px-4",
        xl: "px-16 py-10 text-xl gap-3 rounded-2xl has-[>svg]:px-14",
        icon: "size-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
