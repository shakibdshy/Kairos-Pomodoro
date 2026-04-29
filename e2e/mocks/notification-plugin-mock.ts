// Mock for @tauri-apps/plugin-notification — no-op in browser tests
export async function isPermissionGranted() {
  return false;
}

export async function requestPermission() {
  return "denied";
}

export async function sendNotification(_options: {
  title: string;
  body?: string;
}) {}
