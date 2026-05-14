import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { useEscapeClose } from "@/hooks/use-escape-close";
import { cn } from "@/lib/cn";

interface ModalOverlayProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
  backdropClassName?: string;
  showCloseButton?: boolean;
}

export function ModalOverlay({
  open,
  onClose,
  children,
  maxWidth = "max-w-lg",
  backdropClassName = "bg-black/20",
  showCloseButton = false,
}: ModalOverlayProps) {
  useEscapeClose(open, onClose);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className={cn("absolute inset-0 backdrop-blur-sm", backdropClassName)}
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full bg-sahara-surface rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200",
          maxWidth,
        )}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-sahara-text-muted hover:text-sahara-text hover:bg-sahara-card rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
