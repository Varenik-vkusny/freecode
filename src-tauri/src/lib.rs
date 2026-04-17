use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;
use tauri::Manager;

pub struct SidecarState(std::sync::Mutex<Option<tauri_plugin_shell::process::CommandChild>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        ).unwrap();
      }

      // Spawn the Python backend as a hidden sidecar process
      let sidecar_command = app.shell().sidecar("server")
        .expect("Failed to setup `server` sidecar binary");
      
      let (mut rx, child) = sidecar_command
        .spawn()
        .expect("Failed to spawn sidecar");

      app.manage(SidecarState(std::sync::Mutex::new(Some(child))));

      tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
          if let CommandEvent::Stdout(line) = event {
            println!("backend: {}", String::from_utf8_lossy(&line));
          } else if let CommandEvent::Stderr(line) = event {
            eprintln!("backend error: {}", String::from_utf8_lossy(&line));
          }
        }
      });

      Ok(())
    })
    .build(tauri::generate_context!())
    .expect("error while building tauri application")
    .run(|app_handle, event| {
        if let tauri::RunEvent::Exit = event {
            if let Some(state) = app_handle.try_state::<SidecarState>() {
                if let Ok(mut lock) = state.0.lock() {
                    if let Some(child) = lock.take() {
                        let _ = child.kill();
                    }
                }
            }
        }
    });
}
