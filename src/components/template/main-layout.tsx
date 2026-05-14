import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Minimize2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUIStore } from "@/features/ui/use-ui-store";
import { m, AnimatePresence } from "framer-motion";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isFullscreenFocus = useUIStore((s) => s.isFullscreenFocus);

  return (
    <div className="flex h-screen bg-sahara-bg text-sahara-text font-sans overflow-hidden">
      <AnimatePresence initial={false} mode="popLayout">
        {!isFullscreenFocus && (
          <Sidebar
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          />
        )}
      </AnimatePresence>

      <m.div
        layout
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
        className="flex-1 flex flex-col relative overflow-hidden min-w-0"
      >
        <div
          className="h-8 flex items-center justify-between pl-4 md:pl-8 pr-4 shrink-0"
          data-tauri-drag-region
        />

        <div className={cn(
          "flex-1 scroll-smooth pb-20 md:pb-0",
          isFullscreenFocus ? "overflow-hidden" : "overflow-y-auto"
        )}>
          {children}
        </div>

        <AnimatePresence>
          {isFullscreenFocus && (
            <m.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-8 right-8 z-50"
            >
              <Button
                variant="outline"
                size="icon-lg"
                intent="default"
                shape="rounded-full"
                onClick={() => useUIStore.getState().setFullscreenFocus(false)}
                className="bg-sahara-surface/80 backdrop-blur-md shadow-xl border-sahara-border/40 hover:text-sahara-primary hover:border-sahara-primary/40 group"
                title="Exit Focus Mode"
              >
                <Minimize2 className="size-5 transition-transform group-hover:scale-110" />
              </Button>
            </m.div>
          )}
        </AnimatePresence>

        {!isFullscreenFocus && <MobileNav />}
      </m.div>
    </div>
  );
}
