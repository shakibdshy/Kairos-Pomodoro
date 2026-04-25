use std::sync::Mutex;
use tauri::{Emitter, Manager, tray::TrayIcon};

pub struct MenubarState {
    pub tray: Mutex<Option<TrayIcon>>,
}

impl MenubarState {
    pub fn new() -> Self {
        Self {
            tray: Mutex::new(None),
        }
    }
}

#[tauri::command]
pub fn menubar_show(state: tauri::State<'_, MenubarState>) -> Result<(), String> {
    if let Ok(tray) = state.tray.lock() {
        if let Some(tray) = tray.as_ref() {
            let _ = tray.set_visible(true);
        }
    }
    Ok(())
}

#[tauri::command]
pub fn menubar_hide(state: tauri::State<'_, MenubarState>) -> Result<(), String> {
    if let Ok(tray) = state.tray.lock() {
        if let Some(tray) = tray.as_ref() {
            let _ = tray.set_visible(false);
        }
    }
    Ok(())
}

#[tauri::command]
pub fn menubar_set_title(
    state: tauri::State<'_, MenubarState>,
    title: String,
) -> Result<(), String> {
    if let Ok(tray) = state.tray.lock() {
        if let Some(tray) = tray.as_ref() {
            tray.set_title(Some(&title)).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
pub fn menubar_set_tooltip(
    state: tauri::State<'_, MenubarState>,
    tooltip: String,
) -> Result<(), String> {
    if let Ok(tray) = state.tray.lock() {
        if let Some(tray) = tray.as_ref() {
            tray.set_tooltip(Some(tooltip)).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

pub fn setup_menubar_tray(
    app: &tauri::App,
) -> Result<(), Box<dyn std::error::Error>> {
    use tauri::{
        menu::{Menu, MenuItem, PredefinedMenuItem},
        tray::TrayIconBuilder,
    };

    let show_item =
        MenuItem::with_id(app, "menubar-show", "Show Kairos-Pomodoro", true, None::<&str>)?;
    let toggle_item = MenuItem::with_id(
        app,
        "menubar-toggle",
        "Pause / Resume",
        true,
        None::<&str>,
    )?;
    let separator = PredefinedMenuItem::separator(app)?;
    let quit_item =
        MenuItem::with_id(app, "menubar-quit", "Quit Kairos-Pomodoro", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&show_item, &toggle_item, &separator, &quit_item])?;

    let tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().cloned().unwrap())
        .icon_as_template(true)
        .menu(&menu)
        .tooltip("Kairos-Pomodoro")
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "menubar-show" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "menubar-toggle" => {
                let _ = app.emit("hotkey:toggle-timer", ());
            }
            "menubar-quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .build(app)?;

    if let Some(state) = app.try_state::<MenubarState>() {
        if let Ok(mut handle) = state.tray.lock() {
            *handle = Some(tray);
        }
    }

    Ok(())
}
