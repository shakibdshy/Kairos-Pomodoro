import { invoke } from "@tauri-apps/api/core";

export { invoke };

export const invokeHotkey = (key: string) =>
  invoke("register_hotkey", { key });

export const invokeUnregisterHotkey = (key: string) =>
  invoke("unregister_hotkey", { key });

export const invokeSetDnd = (enabled: boolean) =>
  invoke("set_dnd", { enabled });

let _isTauri: boolean | null = null;

export async function isTauri(): Promise<boolean> {
  if (_isTauri !== null) return _isTauri;
  try {
    await import("@tauri-apps/api/core");
    _isTauri = true;
  } catch {
    _isTauri = false;
  }
  return _isTauri;
}
