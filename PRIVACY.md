# Privacy Policy

**Effective Date:** April 25, 2026  
**App:** Kairos-Pomodoro  
**Version:** 1.0.0

---

## Introduction

Kairos-Pomodoro is a **local-first desktop application** built with Tauri. We believe your productivity data belongs to you — and only you. This policy explains how (or rather, how little) we interact with your personal information.

---

## Data Collection

**We do not collect, transmit, or share any of your personal data externally.**

Kairos-Pomodoro operates entirely on your device. There is:

- ❌ No user accounts or sign-in
- ❌ No analytics or telemetry services
- ❌ No tracking cookies or identifiers
- ❌ No cloud synchronization
- ❌ No third-party data sharing

The app does not send any data from your device to any server at any time.

---

## Local Storage

All of your data is stored **locally on your device** using SQLite (`Kairos-Pomodoro.db`). This includes:

| Data Type | Description |
|---|---|
| **Tasks** | Task names, estimated/completed pomodoros, archive status |
| **Sessions** | Focus session records, duration, completion status, timestamps |
| **Categories** | Custom category names and color preferences |
| **Settings** | App preferences (timer durations, notifications, hotkeys, theme) |

This database file resides within your system's standard application data directory managed by Tauri. It never leaves your machine.

---

## Third-Party Services

### GitHub Releases (App Updates)

Kairos-Pomodoro checks for updates via GitHub Releases (`github.com/shakibdshy/kairos-pomodoro`). This process:

- Only retrieves **version metadata** to determine if an update is available.
- Does **not** transmit any user data, usage statistics, or identifiable information.
- Is optional — you can disable update checks in your system settings.

### Tauri Framework & Dependencies

The app is built on [Tauri](https://tauri.app), a Rust-based framework for building desktop applications. Tauri itself does not collect telemetry through our build. All bundled dependencies operate locally within the app sandbox.

### Open Source Libraries

Kairos-Pomodoro uses the following open-source libraries, all of which run locally:

- React, Zustand (UI & state management)
- Recharts (local analytics rendering)
- Framer Motion (animations)
- Lucide React (icons)
- Tailwind CSS (styling)

None of these libraries initiate external network requests for data collection purposes.

---

## Your Rights & Control

You have **full control** over your data at all times:

1. **View Your Data** — Your SQLite database file can be inspected with any SQLite browser tool.

2. **Export Your Data** — The `Kairos-Pomodoro.db` file can be copied and backed up manually from your system's app data directory.

3. **Delete Your Data** — Navigate to **Settings → Privacy & Data → Clear All Data** to permanently delete all tasks, sessions, categories, and settings from local storage.

4. **Uninstall** — Removing the app will remove the application binary. You may also wish to manually delete the remaining data directory for complete removal.

---

## Security

- All data is stored using SQLite with file-system level permissions provided by your operating system.
- The app runs within Tauri's security sandbox, limiting access to only the resources it needs.
- No network requests are made for data purposes, eliminating network-based attack vectors for data exfiltration.

---

## Children's Privacy

Kairos-Pomodoro does not knowingly collect any personal information from anyone, including children. Since the app stores all data locally and does not transmit anything externally, this policy applies equally to users of all ages.

---

## Changes to This Policy

If we ever change how Kairos-Pomodoro handles data (for example, if optional cloud sync is added in a future version), we will:

1. Update this document clearly and prominently.
2. Make any new data collection **opt-in** and transparent before it is enabled.
3. Announce changes through our release notes.

---

## Contact

If you have questions about this Privacy Policy or how Kairos-Pomodoro handles your data, you can reach us through the [GitHub repository](https://github.com/shakibdshy/kairos-pomodoro/issues).

---

*This privacy policy reflects the fact that Kairos-Pomodoro is designed from the ground up as a privacy-respecting, offline-first application. Your data stays on your device.*
