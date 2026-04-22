const workerCode = `
  let interval = null;
  let remaining = 0;
  let overtime = 0;

  function startCountdown() {
    clearInterval(interval);
    interval = setInterval(() => {
      remaining -= 1;
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
        startCountdown();
      }
    }

    if (e.data.command === "stop") {
      clearInterval(interval);
      interval = null;
      remaining = 0;
      overtime = 0;
    }

    if (e.data.command === "start_overtime") {
      overtime = e.data.startFrom || 0;
      startOvertime();
    }

    if (e.data.command === "add_time") {
      remaining += e.data.seconds;
      if (!interval) {
        startCountdown();
      }
      self.postMessage({ type: "tick", remaining });
    }
  };
`;

const blob = new Blob([workerCode], { type: "application/javascript" });
const workerUrl = URL.createObjectURL(blob);

export function createTimerWorker(): Worker {
  return new Worker(workerUrl);
}
