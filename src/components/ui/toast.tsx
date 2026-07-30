import { AlertTriangle, X } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

interface ToastProps {
  title: string;
  message: string;
  onClose: () => void;
  className?: string;
}

export function Toast({ title, message, onClose, className }: ToastProps) {
  return createPortal(
    <div
        className={cn(
          "fixed top-6 right-6 z-[300] flex w-[min(calc(100vw-2rem),23rem)] items-start gap-3 rounded-2xl border border-red-400/30 bg-sahara-surface/95 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl animate-in slide-in-from-top-2 fade-in duration-200",
          className,
        )}
        role="alert"
        aria-live="assertive"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
          <AlertTriangle className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-semibold text-sahara-text">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-sahara-text-muted">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="-mr-1 -mt-1 rounded-lg p-1.5 text-sahara-text-muted transition-colors hover:bg-sahara-card hover:text-sahara-text"
          aria-label="Dismiss notification"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>,
    document.body,
  );
}
