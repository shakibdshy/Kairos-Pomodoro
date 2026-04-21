const workerCode = `
  let interval = null;
  let remaining = 0;

  self.onmessage = (e) => {
    if (e.data.command === "start") {
      remaining = e.data.seconds;
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

    if (e.data.command === "pause") {
      clearInterval(interval);
      interval = null;
    }

    if (e.data.command === "resume") {
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

    if (e.data.command === "stop") {
      clearInterval(interval);
      interval = null;
      remaining = 0;
    }
  };
`;

const blob = new Blob([workerCode], { type: "application/javascript" });
const workerUrl = URL.createObjectURL(blob);

export function createTimerWorker(): Worker {
  return new Worker(workerUrl);
}
