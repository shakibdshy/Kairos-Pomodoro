import { useEffect } from "react";

export function useEscapeClose(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = () => onClose();
    window.addEventListener("app:escape", handler);
    return () => window.removeEventListener("app:escape", handler);
  }, [isOpen, onClose]);
}
