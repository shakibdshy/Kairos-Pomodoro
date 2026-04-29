// Mock for @tauri-apps/api/event — no-op in browser tests
export async function listen(_event: string, _handler: (event: unknown) => void) {
  return () => {};
}
