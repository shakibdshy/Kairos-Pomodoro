import { createTimerWorker } from "@/features/timer/use-timer-worker";

export interface TimerEngineCallbacks {
  onTick: (remaining: number) => void;
  onDone: () => void;
  onOvertimeTick: (overtime: number) => void;
}

export class TimerEngine {
  private worker: Worker | null = null;
  private overtoneInterval: ReturnType<typeof setInterval> | null = null;
  private callbacks: TimerEngineCallbacks | null = null;

  setCallbacks(cb: TimerEngineCallbacks) {
    this.callbacks = cb;
  }

  start(seconds: number) {
    this.terminate();
    this.clearOvertimeNotif();

    const worker = createTimerWorker();
    worker.onmessage = (e: MessageEvent) => {
      const { type, remaining, overtime } = e.data;
      if (type === "tick") this.callbacks?.onTick(remaining);
      if (type === "done") this.callbacks?.onDone();
      if (type === "overtime_tick") this.callbacks?.onOvertimeTick(overtime);
    };
    worker.postMessage({ command: "start", seconds });
    this.worker = worker;
  }

  pause() {
    this.worker?.postMessage({ command: "pause" });
  }

  resume() {
    this.worker?.postMessage({ command: "resume" });
  }

  addTime(seconds: number) {
    if (this.worker) {
      this.worker.postMessage({ command: "add_time", seconds });
    }
  }

  startOvertime(startFrom = 0) {
    this.terminateWorker();
    const worker = createTimerWorker();
    worker.onmessage = (e: MessageEvent) => {
      const { type, overtime } = e.data;
      if (type === "overtime_tick") this.callbacks?.onOvertimeTick(overtime);
      if (type === "done") this.callbacks?.onDone();
    };
    worker.postMessage({ command: "start_overtime", startFrom });
    this.worker = worker;

    this.overtoneInterval = setInterval(() => {
      this.callbacks?.onDone();
    }, 60_000);
  }

  stopOvertime() {
    this.clearOvertimeNotif();
  }

  private terminateWorker() {
    this.worker?.terminate();
    this.worker = null;
  }

  private clearOvertimeNotif() {
    if (this.overtoneInterval) {
      clearInterval(this.overtoneInterval);
      this.overtoneInterval = null;
    }
  }

  terminate() {
    this.terminateWorker();
    this.clearOvertimeNotif();
  }

  isRunning(): boolean {
    return this.worker !== null;
  }
}
