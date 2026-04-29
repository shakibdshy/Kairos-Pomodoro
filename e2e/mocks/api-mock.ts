// Mock for @tauri-apps/api/core — all exports are no-ops in browser tests
export async function invoke(_cmd: string, _args?: Record<string, unknown>) {
  return null;
}

export async function addPluginListener(
  _plugin: string,
  _event: string,
  _handler: (data: unknown) => void,
) {
  return () => {};
}

export async function convertFileSrc(_filePath: string) {
  return "";
}
