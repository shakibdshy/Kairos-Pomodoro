#[tauri::command]
pub fn set_dnd(enabled: bool) -> Result<(), String> {
    // macOS: Use 'do not disturb' via Focus modes (requires System Events)
    // For MVP, this is a no-op placeholder that returns success.
    // Full implementation would use AppleScript or NSUserNotification API.
    println!("Set DND: {}", enabled);
    Ok(())
}
