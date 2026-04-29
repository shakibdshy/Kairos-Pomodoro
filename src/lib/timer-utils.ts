export const MAX_INPUT_SECONDS = 99 * 60 + 59;

export function sanitizeTimeInput(value: string): string {
  const cleaned = value.replace(/[^\d:]/g, "");
  const [minutesPart = "", secondsPart = ""] = cleaned.split(":");
  const hasColon = cleaned.includes(":");
  const minutes = minutesPart.slice(0, 2);
  const seconds = secondsPart.slice(0, 2);
  return hasColon ? `${minutes}:${seconds}` : minutes;
}

function safeInt(value: string): number {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? 0 : Math.max(0, n);
}

export function parseTimeInput(value: string): number {
  if (!value) return 0;
  if (!value.includes(":")) {
    return Math.min(MAX_INPUT_SECONDS, safeInt(value) * 60);
  }
  const [minutesPart = "0", secondsPart = "0"] = value.split(":");
  const minutes = safeInt(minutesPart);
  const seconds = safeInt(secondsPart);
  return Math.min(MAX_INPUT_SECONDS, minutes * 60 + seconds);
}

export function formatEditableValueFromSeconds(totalSeconds: number): string {
  const bounded = Math.max(
    0,
    Math.min(MAX_INPUT_SECONDS, Math.floor(totalSeconds)),
  );
  const minutes = Math.floor(bounded / 60)
    .toString()
    .padStart(2, "0");
  const seconds = bounded % 60;
  return seconds === 0
    ? minutes
    : `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatEditingDisplay(value: string): string {
  if (!value) return "00:00";
  if (!value.includes(":")) {
    return `${value.padStart(2, "0")}:00`;
  }
  const [minutesPart = "0", secondsPart = ""] = value.split(":");
  return `${minutesPart.padStart(2, "0")}:${secondsPart.padEnd(2, "0")}`;
}
