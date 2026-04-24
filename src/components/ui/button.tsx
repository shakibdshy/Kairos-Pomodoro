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
        outline: "border font-bold tracking-wider uppercase",
        ghost: "",
        destructive: "font-bold tracking-wider uppercase shadow-lg text-white",
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
      // ─── solid ──────────────────────────────────────
      {
        variant: "solid",
        intent: "sahara",
        class:
          "bg-sahara-primary hover:bg-sahara-primary/90 shadow-[0_4px_16px_rgba(194,101,42,0.25)]",
      },
      {
        variant: "solid",
        intent: "green",
        class:
          "bg-[#6b9080] hover:bg-[#5f8071] shadow-[0_4px_16px_rgba(107,144,128,0.25)]",
      },
      {
        variant: "solid",
        intent: "emerald",
        class:
          "bg-[#6b9080] hover:bg-[#5f8071] shadow-[0_4px_16px_rgba(107,144,128,0.25)]",
      },
      {
        variant: "solid",
        intent: "amber",
        class:
          "bg-[#c4956a] hover:bg-[#b8875e] shadow-[0_4px_16px_rgba(196,149,106,0.25)]",
      },
      {
        variant: "solid",
        intent: "red",
        class:
          "bg-[#c45c4a] hover:bg-[#b55040] shadow-[0_4px_16px_rgba(196,92,74,0.25)]",
      },
      {
        variant: "solid",
        intent: "slate",
        class:
          "bg-sahara-card text-sahara-text-secondary hover:bg-sahara-border/30 shadow-sm",
      },
      {
        variant: "solid",
        intent: "default",
        class:
          "bg-sahara-border/30 text-sahara-text-muted hover:bg-sahara-border/40 shadow-sm",
      },

      // ─── outline ────────────────────────────────────
      {
        variant: "outline",
        intent: "sahara",
        class:
          "border-sahara-primary/35 text-sahara-primary bg-sahara-primary-light/60 hover:bg-sahara-primary-light",
      },
      {
        variant: "outline",
        intent: "green",
        class:
          "border-[#6b9080]/35 text-[#6b9080] bg-[#6b9080]/10 hover:bg-[#6b9080]/20",
      },
      {
        variant: "outline",
        intent: "emerald",
        class:
          "border-[#6b9080]/35 text-[#6b9080] bg-[#6b9080]/10 hover:bg-[#6b9080]/20",
      },
      {
        variant: "outline",
        intent: "amber",
        class:
          "border-[#c4956a]/35 text-[#c4956a] bg-[#c4956a]/10 hover:bg-[#c4956a]/20",
      },
      {
        variant: "outline",
        intent: "red",
        class:
          "border-[#c45c4a]/35 text-[#c45c4a] bg-[#c45c4a]/10 hover:bg-[#c45c4a]/20",
      },
      {
        variant: "outline",
        intent: "slate",
        class:
          "border-sahara-border/30 text-sahara-text-secondary bg-transparent hover:bg-sahara-card",
      },
      {
        variant: "outline",
        intent: "default",
        class:
          "border-sahara-border/20 text-sahara-text-secondary bg-transparent hover:bg-sahara-card hover:text-sahara-text",
      },

      // ─── ghost ──────────────────────────────────────
      {
        variant: "ghost",
        intent: "sahara",
        class: "text-sahara-primary hover:bg-sahara-primary-light",
      },
      {
        variant: "ghost",
        intent: "green",
        class: "text-[#6b9080] hover:bg-[#6b9080]/12",
      },
      {
        variant: "ghost",
        intent: "emerald",
        class: "text-[#6b9080] hover:bg-[#6b9080]/12",
      },
      {
        variant: "ghost",
        intent: "amber",
        class: "text-[#c4956a] hover:bg-[#c4956a]/12",
      },
      {
        variant: "ghost",
        intent: "red",
        class: "text-[#c45c4a] hover:bg-[#c45c4a]/12",
      },
      {
        variant: "ghost",
        intent: "slate",
        class: "text-sahara-text-secondary hover:bg-sahara-card",
      },
      {
        variant: "ghost",
        intent: "default",
        class:
          "text-sahara-text-secondary hover:bg-sahara-card hover:text-sahara-text",
      },

      // ─── link ───────────────────────────────────────
      {
        variant: "link",
        intent: "sahara",
        class: "text-sahara-primary hover:text-sahara-primary/80",
      },
      {
        variant: "link",
        intent: "default",
        class: "text-sahara-text-muted hover:text-sahara-primary",
      },

      // ─── nav ────────────────────────────────────────
      {
        variant: "nav",
        active: false,
        class:
          "text-sahara-text-secondary hover:bg-sahara-card hover:text-sahara-text",
      },
      {
        variant: "nav",
        active: true,
        class:
          "bg-sahara-primary-light text-sahara-primary font-bold shadow-sm shadow-sahara-primary/5",
      },
      {
        variant: "nav",
        intent: "default",
        active: false,
        class:
          "text-sahara-text-muted hover:text-sahara-text-secondary hover:bg-transparent",
      },

      // ─── outline active ─────────────────────────────
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
          "bg-sahara-primary-light border-sahara-primary/35 text-sahara-primary shadow-sm",
      },
      {
        variant: "outline",
        active: true,
        intent: "green",
        class: "bg-[#6b9080]/10 border-[#6b9080]/35 text-[#6b9080] shadow-sm",
      },
      {
        variant: "outline",
        active: true,
        intent: "red",
        class: "bg-[#c45c4a]/10 border-[#c45c4a]/35 text-[#c45c4a] shadow-sm",
      },

      // ─── ghost active ──────────────────────────────
      {
        variant: "ghost",
        active: true,
        intent: "default",
        class: "bg-sahara-surface text-sahara-primary shadow-sm",
      },
      {
        variant: "ghost",
        active: true,
        intent: "sahara",
        class: "bg-sahara-surface text-sahara-primary shadow-sm",
      },
      {
        variant: "ghost",
        active: true,
        intent: "green",
        class: "bg-[#6b9080]/10 text-[#6b9080] shadow-sm",
      },
      {
        variant: "ghost",
        active: true,
        intent: "red",
        class: "bg-[#c45c4a]/10 text-[#c45c4a] shadow-sm",
      },

      // ─── destructive ───────────────────────────────
      {
        variant: "destructive",
        intent: "red",
        class:
          "bg-[#c45c4a] text-white hover:bg-[#b55040] shadow-[0_4px_16px_rgba(196,92,74,0.25)]",
      },
      {
        variant: "destructive",
        intent: "default",
        class:
          "bg-[#c45c4a] text-white hover:bg-[#b55040] shadow-[0_4px_16px_rgba(196,92,74,0.25)]",
      },
    ],
  },
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
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
