import { invoke } from "@tauri-apps/api/core";

export { invoke };

export const invokeHotkey = (key: string) =>
  invoke("register_hotkey", { key });

export const invokeUnregisterHotkey = (key: string) =>
  invoke("unregister_hotkey", { key });

export const invokeSetDnd = (enabled: boolean) =>
  invoke("set_dnd", { enabled });

export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}
