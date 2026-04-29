const workerCode = `
  let interval = null;
  let remaining = 0;
  let overtime = 0;
  let targetEndTime = 0;

  function computeRemaining() {
    return Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000));
  }

  function startCountdown() {
    clearInterval(interval);
    interval = setInterval(() => {
      remaining = computeRemaining();
      if (remaining <= 0) {
        clearInterval(interval);
        interval = null;
        self.postMessage({ type: "done", remaining: 0 });
      } else {
        self.postMessage({ type: "tick", remaining });
      }
    }, 1000);
  }

  function startOvertime() {
    clearInterval(interval);
    interval = setInterval(() => {
      overtime += 1;
      self.postMessage({ type: "overtime_tick", overtime });
    }, 1000);
  }

  self.onmessage = (e) => {
    if (e.data.command === "start") {
      remaining = e.data.seconds;
      overtime = 0;
      targetEndTime = Date.now() + remaining * 1000;
      startCountdown();
    }

    if (e.data.command === "pause") {
      clearInterval(interval);
      interval = null;
    }

    if (e.data.command === "resume") {
      if (overtime > 0) {
        startOvertime();
      } else {
        targetEndTime = Date.now() + remaining * 1000;
        startCountdown();
      }
    }

    if (e.data.command === "stop") {
      clearInterval(interval);
      interval = null;
      remaining = 0;
      overtime = 0;
      targetEndTime = 0;
    }

    if (e.data.command === "start_overtime") {
      overtime = e.data.startFrom || 0;
      startOvertime();
    }

    if (e.data.command === "add_time") {
      targetEndTime += e.data.seconds * 1000;
      remaining = computeRemaining();
      if (!interval) {
        startCountdown();
      }
      self.postMessage({ type: "tick", remaining });
    }

    if (e.data.command === "done") {
      onDone?.();
      set({ secondsRemaining: remaining });
    }

    if (e.data.command === "overtime_tick") {
      onOvertimeTick?.(overtime);
    }
  };
`;

const blob = new Blob([workerCode], { type: "application/javascript" });
const workerUrl = URL.createObjectURL(blob);

export function createTimerWorker(): Worker {
  return new Worker(workerUrl);
}
