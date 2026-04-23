import { useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Target,
  Zap,
  Clock,
  Star,
} from "lucide-react";
import type { PageProps } from "@/app/router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const STEP_ICON_COLOR = "bg-sahara-primary-light text-sahara-primary";

const steps = [
  {
    title: "Welcome to Deep Work",
    subtitle: "A sanctuary for your focus.",
    description:
      "Kairos is designed to help you reclaim your attention and achieve flow state through intentional focus sessions.",
    icon: Star,
  },
  {
    title: "The Focus Rhythm",
    subtitle: "25 minutes of pure intent.",
    description:
      "We use a refined pomodoro technique. Focus for 25 minutes, then take a 5 minute breath. Every 4 sessions, enjoy a longer rest.",
    icon: Zap,
  },
  {
    title: "Curate Your Day",
    subtitle: "Tasks with purpose.",
    description:
      "Link your focus sessions directly to tasks. Track your progress and see your productivity grow over time.",
    icon: Target,
  },
  {
    title: "Insights & Growth",
    subtitle: "Data that empowers.",
    description:
      "Visualize your focus distribution and build a streak. Consistency is the key to mastering deep work.",
    icon: Clock,
  },
];

export function OnboardingPage({ onNavigate }: PageProps) {
  const [step, setStep] = useState(0);

  const currentStep = steps[step];

  return (
    <div className="h-screen bg-sahara-bg flex items-center justify-center p-8 overflow-hidden">
      <div className="max-w-4xl w-full grid grid-cols-2 bg-sahara-surface rounded-[40px] shadow-2xl shadow-sahara-primary/10 overflow-hidden border border-sahara-border/20 min-h-150">
        {/* Left Side: Illustration/Brand */}
        <div className="bg-sahara-primary p-16 flex flex-col justify-between text-white relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full border-40 border-white"></div>
            <div className="absolute bottom-[10%] left-[-20%] w-[80%] h-[80%] rounded-full border-20 border-white"></div>
          </div>

          <div>
            <h1 className="font-serif text-4xl tracking-tight mb-2">Kairos</h1>
            <p className="text-[10px] tracking-[0.3em] font-bold uppercase opacity-70">
              The Art of Focus
            </p>
          </div>

          <div className="relative z-10">
            <h2 className="font-serif text-5xl leading-tight mb-6">
              {currentStep.title}
            </h2>
            <p className="text-white/80 text-lg font-medium leading-relaxed">
              {currentStep.subtitle}
            </p>
          </div>

          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === step
                    ? "w-8 bg-sahara-surface"
                    : "w-2 bg-sahara-surface/30",
                )}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Content & Actions */}
        <div className="p-16 flex flex-col justify-between">
          <div className="flex justify-end">
            <Button
              variant="link"
              intent="default"
              size="xs"
              className="text-[10px] tracking-widest uppercase"
              onClick={() => onNavigate("timer")}
            >
              Skip to App
            </Button>
          </div>

          <div className="space-y-8">
            <div
              className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg shadow-sahara-primary/10",
                STEP_ICON_COLOR,
              )}
            >
              <currentStep.icon className="w-10 h-10" />
            </div>

            <div className="space-y-4">
              <h3 className="font-serif text-3xl text-sahara-text">
                {currentStep.title}
              </h3>
              <p className="text-sahara-text-secondary leading-relaxed">
                {currentStep.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-sahara-border/10">
            <Button
              variant="ghost"
              size="sm"
              intent="default"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className={cn(
                "gap-2 text-xs tracking-widest",
                step === 0 && "text-sahara-border",
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              BACK
            </Button>

            {step === steps.length - 1 ? (
              <Button
                variant="solid"
                intent="sahara"
                size="xl"
                shape="rounded-2xl"
                onClick={() => onNavigate("timer")}
                className="hover:scale-[1.02] active:scale-[0.98] shadow-xl"
              >
                GET STARTED
              </Button>
            ) : (
              <Button
                variant="solid"
                intent="sahara"
                size="lg"
                shape="rounded-2xl"
                onClick={() =>
                  setStep((s) => Math.min(steps.length - 1, s + 1))
                }
                className="gap-2 shadow-xl group"
              >
                CONTINUE
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
