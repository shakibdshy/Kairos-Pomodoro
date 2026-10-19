// Exported for unit tests: the script runs inside a Web Worker, so the tests
// evaluate it against a sandboxed `self` instead of instantiating a Worker.
export const timerWorkerCode = `
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
      if (interval) {
        targetEndTime += e.data.seconds * 1000;
        remaining = computeRemaining();
        self.postMessage({ type: "tick", remaining });
      } else {
        // Paused: carry the adjustment so Resume honors it, but keep the
        // countdown frozen — the wall-clock deadline is stale while paused,
        // so it must not be consulted.
        remaining = Math.max(0, remaining + e.data.seconds);
      }
    }
  };
`;

const blob = new Blob([timerWorkerCode], { type: "application/javascript" });

export function createTimerWorker(): Worker {
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);
  URL.revokeObjectURL(url);
  return worker;
}
