const MAX_MINUTES = 999;
export const MAX_INPUT_SECONDS = MAX_MINUTES * 60 + 59;

const MINUTE_DIGITS = MAX_MINUTES.toString().length;
const SECOND_DIGITS = 2;

/** Shared with the duration input's `pattern` so entry and clamping agree. */
export const TIME_INPUT_PATTERN = `[0-9:]{0,${MINUTE_DIGITS}}(:[0-9]{0,${SECOND_DIGITS}})?`;

export function sanitizeTimeInput(value: string): string {
  const cleaned = value.replace(/[^\d:]/g, "");
  const [minutesPart = "", secondsPart = ""] = cleaned.split(":");
  const hasColon = cleaned.includes(":");
  const minutes = minutesPart.slice(0, MINUTE_DIGITS);
  const seconds = secondsPart.slice(0, SECOND_DIGITS);
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
