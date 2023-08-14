// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
// Basic FS commands: Check exists, list dir files/folders, rename, write, create dir, remove, remove dir

#[tauri::command]
fn exists(path: String) -> Result<bool, String> {
    let path = std::path::Path::new(&path);
    Ok(path.exists())
}

#[tauri::command]
fn list_dir(path: String) -> Result<Vec<String>, String> {
    // list files and folders in a directory (not recursive)
    let path = std::path::Path::new(&path);
    let mut files: Vec<String> = Vec::new();
    for entry in std::fs::read_dir(path).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        let path = path.to_str().unwrap().to_string();
        files.push(path);
    }
    Ok(files)
}

#[tauri::command]
fn rename(from: String, to: String) -> Result<(), String> {
    let from = std::path::Path::new(&from);
    let to = std::path::Path::new(&to);
    std::fs::rename(from, to).map_err(|e| e.to_string())
}

#[tauri::command]
fn write(path: String, data: String) -> Result<(), String> {
    std::fs::write(path, data).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_dir(path: String) -> Result<(), String> {
    std::fs::create_dir(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn remove(path: String) -> Result<(), String> {
    std::fs::remove_file(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn remove_dir(path: String) -> Result<(), String> {
    std::fs::remove_dir_all(path).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            exists, list_dir, rename, write, create_dir, remove, remove_dir
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
