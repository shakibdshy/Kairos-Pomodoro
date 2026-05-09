/**
 * Generates a muted, earthy color in the Sahara palette using HSL.
 * Suitable for category badges and UI accents on both light and dark themes.
 */

export const CATEGORY_PRESET_COLORS = [
  "#C17767", "#8B9E6B", "#4A7C59", "#5B8FA3",
  "#9B7EBD", "#D4A574", "#E07A5F", "#81B29A",
  "#F2CC8F", "#E76F51",
] as const;

/**
 * Generate a random muted color in hex.
 *
 * Hue: full 0-360 spectrum
 * Saturation: 35-55% (muted, not neon)
 * Lightness: 42-58% (readable on light and dark)
 */
export function generateCategoryColor(): string {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 35 + Math.floor(Math.random() * 21);
  const lightness = 42 + Math.floor(Math.random() * 17);
  return hslToHex(hue, saturation, lightness);
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
