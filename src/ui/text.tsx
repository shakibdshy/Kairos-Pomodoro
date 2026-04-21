import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const textVariants = cva("", {
  variants: {
    variant: {
      h1: "text-4xl font-serif tracking-tight",
      h2: "text-2xl font-serif tracking-tight",
      h3: "text-lg font-bold tracking-widest uppercase",
      body: "text-sm leading-relaxed",
      caption: "text-xs text-sahara-text-muted",
      timer:
        "text-[120px] font-serif leading-none tracking-tight [font-variant-numeric:tabular-nums]",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

export interface TextProps
  extends
    HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {}

export function Text({ className, variant, ...props }: TextProps) {
  return <p className={cn(textVariants({ variant, className }))} {...props} />;
}
