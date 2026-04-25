#[tauri::command]
pub fn is_dnd_enabled() -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    {
        let output = std::process::Command::new("defaults")
            .args([
                "read",
                "com.apple.controlcenter",
                "NSFocusStatusEnabled",
            ])
            .output();

        match output {
            Ok(o) if o.status.success() => {
                let stdout = String::from_utf8_lossy(&o.stdout).trim().to_string();
                Ok(stdout == "1")
            }
            _ => Ok(false),
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        Ok(false)
    }
}

#[tauri::command]
pub fn set_dnd(_enabled: bool) -> Result<(), String> {
    Err("Changing system Do Not Disturb settings requires OS-level permissions. Please use System Settings (macOS) or Action Center (Windows) instead.".to_string())
}
