use tauri::{AppHandle, Emitter};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

fn parse_shortcut(key: &str) -> Result<Shortcut, String> {
    let mut modifiers = Modifiers::empty();
    let mut code = None;

    for part in key.split('+') {
        let part = part.trim();
        match part.to_lowercase().as_str() {
            "commandorcontrol" | "cmdorctrl" | "command" | "cmd" | "ctrl" => {
                modifiers |= Modifiers::SUPER;
            }
            "alt" | "option" => {
                modifiers |= Modifiers::ALT;
            }
            "shift" => {
                modifiers |= Modifiers::SHIFT;
            }
            "super" | "meta" => {
                modifiers |= Modifiers::SUPER;
            }
            "s" => code = Some(Code::KeyS),
            _ => return Err(format!("Unknown key part: {}", part)),
        }
    }

    let code = code.ok_or("No key code found")?;
    Ok(Shortcut::new(Some(modifiers), code))
}

#[tauri::command]
pub fn register_hotkey(app: AppHandle, key: String) -> Result<(), String> {
    let shortcut = parse_shortcut(&key)?;
    let gs = app.global_shortcut();
    let app_handle = app.clone();
    gs.on_shortcut(shortcut, move |_app, _shortcut, event| {
        if event.state == ShortcutState::Pressed {
            let _ = app_handle.emit("hotkey:toggle-timer", ());
        }
    })
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn unregister_hotkey(app: AppHandle, key: String) -> Result<(), String> {
    let shortcut = parse_shortcut(&key)?;
    let gs = app.global_shortcut();
    gs.unregister(shortcut)
        .map_err(|e| e.to_string())?;
    Ok(())
}
