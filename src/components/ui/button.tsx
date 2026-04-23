import { type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const shapeMap = {
  "rounded-lg": "rounded-lg",
  "rounded-xl": "rounded-xl",
  "rounded-2xl": "rounded-2xl",
  "rounded-full": "rounded-full",
} as const;

type Shape = keyof typeof shapeMap;

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        solid: "font-bold tracking-widest uppercase shadow-lg text-white",
        outline:
          "border font-bold tracking-wider uppercase",
        ghost: "",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        nav: "w-full flex items-center transition-all duration-200 group",
        link: "font-bold",
      },
      size: {
        xs: "px-3 py-1.5 text-[10px]",
        sm: "px-4 py-3 text-[10px]",
        md: "px-6 py-3 text-xs",
        lg: "px-8 py-3.5 text-xs",
        xl: "px-10 py-4 text-xs",
        "icon-sm": "p-1.5",
        icon: "p-2",
        "icon-lg": "h-8 w-8 flex items-center justify-center",
      },
      intent: {
        sahara: "",
        emerald: "",
        amber: "",
        green: "",
        red: "",
        slate: "",
        default: "",
      },
      active: {
        true: "",
        false: "",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
      intent: "sahara",
      active: false,
      fullWidth: false,
    },
    compoundVariants: [
      // --- solid + color ---
      {
        variant: "solid",
        intent: "sahara",
        class:
          "bg-sahara-primary hover:bg-sahara-primary/90 shadow-sahara-primary/20",
      },
      {
        variant: "solid",
        intent: "emerald",
        class: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
      },
      {
        variant: "solid",
        intent: "amber",
        class: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
      },
      {
        variant: "solid",
        intent: "green",
        class: "bg-green-500 hover:bg-green-600 shadow-green-500/20",
      },
      {
        variant: "solid",
        intent: "red",
        class: "bg-red-500 hover:bg-red-600 shadow-red-500/20",
      },
      {
        variant: "solid",
        intent: "slate",
        class: "bg-slate-600 hover:bg-slate-700 shadow-slate-600/20",
      },
      {
        variant: "solid",
        intent: "default",
        class:
          "bg-sahara-border/30 text-sahara-text-muted hover:bg-sahara-border/40 shadow-sahara-border/10",
      },

      // --- outline + color ---
      {
        variant: "outline",
        intent: "sahara",
        class:
          "border-sahara-primary/30 text-sahara-primary bg-sahara-primary-light hover:bg-sahara-primary-light/80",
      },
      {
        variant: "outline",
        intent: "emerald",
        class:
          "border-emerald-600/30 text-emerald-600 bg-emerald-50 hover:bg-emerald-100",
      },
      {
        variant: "outline",
        intent: "amber",
        class:
          "border-amber-500/30 text-amber-500 bg-amber-50 hover:bg-amber-100",
      },
      {
        variant: "outline",
        intent: "green",
        class:
          "border-green-500/30 text-green-600 bg-green-50 hover:bg-green-100",
      },
      {
        variant: "outline",
        intent: "red",
        class:
          "border-red-300/50 text-red-500 bg-red-50/50 hover:bg-red-100/80",
      },
      {
        variant: "outline",
        intent: "slate",
        class:
          "border-slate-300/50 text-slate-500 bg-slate-50/80 hover:bg-slate-100/80",
      },
      {
        variant: "outline",
        intent: "default",
        class:
          "border-sahara-border/20 text-sahara-text-secondary bg-transparent hover:bg-sahara-card",
      },

      // --- ghost + color ---
      {
        variant: "ghost",
        intent: "sahara",
        class:
          "text-sahara-primary hover:bg-sahara-primary-light",
      },
      {
        variant: "ghost",
        intent: "emerald",
        class: "text-emerald-600 hover:bg-emerald-50",
      },
      {
        variant: "ghost",
        intent: "amber",
        class: "text-amber-500 hover:bg-amber-50",
      },
      {
        variant: "ghost",
        intent: "green",
        class: "text-green-600 hover:bg-green-50",
      },
      {
        variant: "ghost",
        intent: "red",
        class: "text-red-500 hover:bg-red-50",
      },
      {
        variant: "ghost",
        intent: "slate",
        class: "text-slate-500 hover:bg-slate-50",
      },
      {
        variant: "ghost",
        intent: "default",
        class:
          "text-sahara-text-secondary hover:bg-sahara-card hover:text-sahara-text",
      },

      // --- link + color ---
      {
        variant: "link",
        intent: "sahara",
        class: "text-sahara-primary hover:text-sahara-primary/80",
      },
      {
        variant: "link",
        intent: "default",
        class:
          "text-sahara-text-muted hover:text-sahara-primary",
      },

      // --- nav inactive ---
      {
        variant: "nav",
        active: false,
        class: "text-sahara-text-secondary hover:bg-sahara-card hover:text-sahara-text",
      },
      // --- nav active ---
      {
        variant: "nav",
        active: true,
        class:
          "bg-sahara-primary-light text-sahara-primary font-bold shadow-sm shadow-sahara-primary/5",
      },
      // --- nav-specific inactive for muted text ---
      {
        variant: "nav",
        intent: "default",
        active: false,
        class: "text-sahara-text-muted hover:text-sahara-text-secondary hover:bg-transparent",
      },

      // --- outline active (selectable items) ---
      {
        variant: "outline",
        active: true,
        intent: "default",
        class: "bg-sahara-surface border-sahara-border shadow-sm",
      },
      {
        variant: "outline",
        active: true,
        intent: "sahara",
        class:
          "bg-sahara-primary-light border-sahara-primary/30 text-sahara-primary shadow-sm",
      },

      // --- ghost active (pill selectors, category items) ---
      {
        variant: "ghost",
        active: true,
        intent: "default",
        class:
          "bg-sahara-surface text-sahara-primary shadow-sm",
      },
      {
        variant: "ghost",
        active: true,
        intent: "sahara",
        class: "bg-sahara-surface text-sahara-primary shadow-sm",
      },

      // --- destructive + color overrides ---
      {
        variant: "destructive",
        intent: "red",
        class: "bg-red-500 text-white hover:bg-red-600",
      },
    ],
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  shape?: Shape;
}

export function Button({
  className,
  variant,
  size,
  intent,
  active,
  fullWidth,
  shape = "rounded-xl",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        buttonVariants({ variant, size, intent, active, fullWidth }),
        shapeMap[shape],
        className,
      )}
      {...props}
    />
  );
}
