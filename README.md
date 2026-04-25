# Kairos-Pomodoro

<p align="center">
  <img src="./kairos-banner.png" alt="Kairos-Pomodoro Banner" width="800" />
</p>

<h3 align="center">
  <a href="https://github.com/shakibdshy/Kairos-Pomodoro/releases/download/v1.0.0/Kairos-Pomodoro_1.0.0_aarch64.dmg">🍎 macOS (Apple Silicon)</a> &nbsp;·&nbsp;
  <a href="https://github.com/shakibdshy/Kairos-Pomodoro/releases/download/v1.0.0/Kairos-Pomodoro_1.0.0_x64-setup.exe">🪟 Windows</a> &nbsp;·&nbsp;
  <a href="https://github.com/shakibdshy/Kairos-Pomodoro/releases/download/v1.0.0/Kairos-Pomodoro_1.0.0_amd64.AppImage">🐧 Linux</a>
</h3>

<p align="center">
  <sup><strong>v1.0.0</strong> &nbsp;·&nbsp; MIT Licensed &nbsp;·&nbsp; <a href="#getting-started">Build from source →</a></sup>
</p>

<br />

## 🍎 macOS Installation Guide

> **Important:** Kairos-Pomodoro is not signed with an Apple Developer certificate (it's free & open source). macOS will show a security warning on first launch. Follow these steps to open the app:

### Step 1: Download & Install

Download the `.dmg` file for macOS (Apple Silicon), open it, and drag **Kairos-Pomodoro** into your **Applications** folder.

<p align="center">
  <img src="./doc/install.png" alt="Step 1: Drag to Applications" width="520" />
</p>

### Step 2: First Launch — Security Warning

When you try to open Kairos-Pomodoro for the first time, you may see this warning:

<p align="center">
  <img src="./doc/kairos-not-opend.png" alt="Step 2: Security warning dialog" width="480" />
</p>

**Don't click "Move to Trash"!** This is normal for unsigned apps distributed outside the Mac App Store.

### Step 3: Allow the App

There are two ways to bypass this security check:

#### Method A: Right-Click → Open (Easiest)

Instead of double-clicking, **right-click** on Kairos-Pomodoro in your Applications folder and select **"Open"**. You'll see this dialog — click **"Open Anyway"**:

<p align="center">
  <img src="./doc/open-anyway.png" alt="Method A: Right-click Open Anyway" width="460" />
</p>

#### Method B: System Settings (If Method A doesn't work)

1. Open **System Settings → Privacy & Security**
2. Scroll down to the **Security** section
3. You'll see a message about Kairos-Pomodoro being blocked
4. Click **"Open Anyway"**

<p align="center">
  <img src="./doc/privary-and-security.png" alt="Method B: System Settings Open Anyway" width="560" />
</p>

### Step 4: Done!

After clicking "Open Anyway" once, Kairos-Pomodoro will launch normally from now on. You won't see this warning again unless you update to a new version.

> **Why does this happen?** Apple requires all apps to be code-signed by an Apple Developer ($99/year) or distributed through the Mac App Store. As a free open-source project, Kairos-Pomodoro uses ad-hoc signing which is safe but triggers Gatekeeper's initial warning. This is standard practice for most Tauri/Electron apps on GitHub.

---

## What Kairos-Pomodoro Does

Kairos-Pomodoro is designed around focused work sessions and local-first productivity tracking.
It combines a Pomodoro-style timer, task tracking, local analytics, calendar-style
session history, desktop notifications, tray/menubar updates, and local SQLite
storage in one app.

This README is written for developers and contributors who want to:

- understand what the app does
- run the project locally
- build the desktop app
- know where the important code lives

## What Kairos-Pomodoro Does

Kairos-Pomodoro is designed around focused work sessions and local-first productivity
tracking.

Core features currently present in the codebase:

- Focus timer with `work`, `short break`, and `long break` phases
- Adjustable durations for each timer phase
- Overtime flow after a session completes
- Task management with Pomodoro estimates and progress tracking
- Categories and intentions linked to sessions
- Daily and weekly analytics
- Weekly calendar timeline of completed sessions
- Desktop notifications and sound alerts
- Global shortcut support
- Tray/menubar integration
- Local SQLite persistence

## Tech Stack

- Tauri 2
- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4
- Zustand
- Recharts
- SQLite via `@tauri-apps/plugin-sql`
- Bun for JavaScript package management and scripts
- Rust for the native Tauri layer

## Prerequisites

Before running Kairos-Pomodoro, install the following:

1. `Bun`
2. `Rust`
3. Tauri system dependencies for your OS

### 1. Install Bun

Use the official guide:

- [https://bun.sh/docs/installation](https://bun.sh/docs/installation)

Check that Bun is installed:

```bash
bun --version
```

### 2. Install Rust

Use the official installer:

- [https://www.rust-lang.org/tools/install](https://www.rust-lang.org/tools/install)

Check that Rust is installed:

```bash
rustc --version
cargo --version
```

### 3. Install Tauri Prerequisites

Tauri needs extra OS-level dependencies depending on your platform.
Follow the official Tauri prerequisites guide:

- [https://v2.tauri.app/start/prerequisites/](https://v2.tauri.app/start/prerequisites/)

Common examples:

- macOS: Xcode Command Line Tools
- Windows: Microsoft C++ Build Tools / WebView2 requirements
- Linux: WebKitGTK and related desktop packages

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Kairos-Pomodoro
```

### 2. Install dependencies

```bash
bun install
```

### 3. Start the app in development mode

```bash
bun run tauri dev
```

What this does:

- starts the Vite dev server on `http://localhost:1420`
- launches the Tauri desktop shell
- reloads the frontend during development

## Available Scripts

From the project root:

```bash
bun run dev
```

Starts the Vite frontend only.

```bash
bun run build
```

Builds the frontend into `dist/`.

```bash
bun run tauri dev
```

Runs the full desktop app in development.

```bash
bun run tauri build
```

Builds packaged desktop binaries/installers through Tauri.

## First Run Behavior

On startup, the app:

1. initializes the local SQLite database
2. creates the required tables if they do not exist
3. loads saved settings
4. loads tasks
5. checks notification permission status

Current first-run note:

- if there are no tasks yet, the UI seeds a few example tasks automatically

## Data Storage

Kairos-Pomodoro stores data locally using SQLite through Tauri's SQL plugin.

Database details:

- database file name: `Kairos-Pomodoro.db`
- storage model: local-only
- backend: SQLite

Main persisted data:

- tasks
- sessions
- settings
- categories
- simple schema version metadata

No external backend or cloud service is configured in this codebase.

## Project Structure

```text
Kairos-Pomodoro/
├── src/                 # React frontend
│   ├── app/             # App shell, router, providers
│   ├── components/      # UI, layouts, settings, task/timer/calendar pieces
│   ├── features/        # Zustand stores and system integrations
│   ├── lib/             # DB, notifications, helpers, constants
│   └── pages/           # Top-level routes
├── src-tauri/           # Native Tauri/Rust app
│   ├── src/
│   │   ├── commands/    # Native commands (hotkey, menubar, DND)
│   │   ├── lib.rs       # Tauri setup and plugin registration
│   │   └── main.rs      # Native entry point
│   └── tauri.conf.json  # Tauri app config
├── public/              # Static assets
├── package.json         # Frontend scripts and dependencies
└── bun.lock             # Bun lockfile
```

## Main Frontend Routes

Defined in the router:

- `/` - timer dashboard
- `/tasks` - task management
- `/calendar` - weekly session timeline
- `/analytics` - focus analytics
- `/settings` - app settings
- `/onboarding` - onboarding flow

## Key Files

Useful files to read first:

- `package.json` - scripts and JavaScript dependencies
- `vite.config.ts` - Vite config and dev server port
- `src/app/providers.tsx` - app initialization flow
- `src/lib/db.ts` - SQLite schema, queries, and migrations
- `src/features/timer/use-timer-store.ts` - timer logic
- `src/features/tasks/use-task-store.ts` - task state management
- `src/features/settings/use-settings-store.ts` - persisted settings
- `src-tauri/src/lib.rs` - native plugin setup, tray, and commands
- `src-tauri/tauri.conf.json` - Tauri build/dev settings

## Desktop Integrations

Native integrations currently wired into the app include:

- tray icon
- menubar/tray title updates during active sessions
- global shortcut registration
- notifications
- autostart plugin registration
- window state persistence
- local SQLite access

Default global shortcut in the codebase:

- `CommandOrControl+Alt+S`

Frontend keyboard shortcuts shown in the app:

- `Cmd/Ctrl + Enter` - start or pause timer
- `Cmd/Ctrl + R` - reset timer
- `Cmd/Ctrl + F` - finish session
- `Escape` - close modal

## Development Notes

Important implementation details discovered from the current codebase:

- the frontend uses `HashRouter`, which fits desktop app routing well
- Vite runs on port `1420`
- the Tauri config runs `bun run dev` before launching the desktop shell
- the app uses local Zustand stores rather than a remote API
- analytics export buttons are present in the UI but currently disabled
- the privacy screen says all data is local, which matches the current implementation

## Known Gaps And Caveats

These are useful to know before extending the project:

- the README reflects the current implementation, not a planned roadmap
- Do Not Disturb handling is not fully implemented in the native layer yet
- some analytics/export actions are visible in the UI but not active
- the onboarding route exists, but the app does not currently force a first-run onboarding flow

## Verified Commands

The frontend production build was verified successfully with:

```bash
bun run build
```

The build currently completes, but Vite reports a large JavaScript chunk warning.
This does not block the build, but it is a good future optimization target.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/)
- [Tauri VS Code Extension](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Troubleshooting

### Tauri app does not start

Check:

- `bun install` has been run
- Rust is installed correctly
- Tauri prerequisites for your OS are installed

### Notifications do not appear

Check:

- your OS notification permissions
- app notification permission in system settings
- the in-app notification settings

### Build works but desktop packaging fails

This usually means an OS-level Tauri dependency is missing.
Recheck the official prerequisites:

- [https://v2.tauri.app/start/prerequisites/](https://v2.tauri.app/start/prerequisites/)

## Contribution Workflow

Basic local workflow:

```bash
bun install
bun run tauri dev
```

Before shipping changes:

```bash
bun run build
```

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file.

You are free to use, modify, and distribute this software, including commercially.
Premium support options may be offered separately in the future.
