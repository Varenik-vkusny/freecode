// Configuration helpers for API key and settings folder

const API_KEY_KEY = "freecode:api_key";
const SETTINGS_FOLDER_KEY = "freecode:settings_folder";

export function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(API_KEY_KEY);
  } catch {
    return null;
  }
}

export function saveApiKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(API_KEY_KEY, key);
  } catch {
    console.error("Failed to save API key to localStorage");
  }
}

export function getSettingsFolder(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(SETTINGS_FOLDER_KEY);
  } catch {
    return null;
  }
}

export function saveSettingsFolder(folder: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_FOLDER_KEY, folder);
  } catch {
    console.error("Failed to save settings folder to localStorage");
  }
}

export function hasOnboarded(): boolean {
  return !!getApiKey() && !!getSettingsFolder();
}

export async function getConfigFromBackend(): Promise<{ api_key?: string; settings_folder?: string; working_dir?: string } | null> {
  // 1. Check if running in Tauri
  const isTauri = typeof window !== "undefined" && !!(window as any).__TAURI_INTERNALS__;
  if (isTauri) {
    try {
      const { homeDir, join } = await import("@tauri-apps/api/path");
      const { readTextFile, exists } = await import("@tauri-apps/plugin-fs");
      
      const home = await homeDir();
      const settingsFolder = await join(home, ".freecode");
      const configPath = await join(settingsFolder, "freecode.json");

      if (await exists(configPath)) {
        const content = await readTextFile(configPath);
        return JSON.parse(content);
      }
      
      // Fallback to local root if possible (though less common in a bundled app)
      return null;
    } catch (e) {
      console.error("Tauri config read failed:", e);
    }
  }

  // 2. Fallback to Next.js API (browser mode)
  try {
    const response = await fetch("/api/config");
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch config from backend:", error);
    return null;
  }
}

export async function sendConfigToBackend(
  apiKey: string,
  settingsFolder: string
): Promise<boolean> {
  // 1. Check if running in Tauri
  const isTauri = typeof window !== "undefined" && !!(window as any).__TAURI_INTERNALS__;
  if (isTauri) {
    try {
      const { join } = await import("@tauri-apps/api/path");
      const { writeTextFile, mkdir, exists } = await import("@tauri-apps/plugin-fs");
      
      if (!(await exists(settingsFolder))) {
        await mkdir(settingsFolder, { recursive: true });
      }

      const configPath = await join(settingsFolder, "freecode.json");
      let config: any = {};
      try {
        if (await exists(configPath)) {
          config = JSON.parse(await (import("@tauri-apps/plugin-fs").then(m => m.readTextFile(configPath))));
        }
      } catch {}

      config.api_key = apiKey;
      config.settings_folder = settingsFolder;

      await writeTextFile(configPath, JSON.stringify(config, null, 2));
      return true;
    } catch (e) {
      console.error("Tauri config save failed:", e);
    }
  }

  // 2. Fallback to Next.js API
  try {
    const response = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey, settings_folder: settingsFolder }),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to send config to backend:", error);
    return false;
  }
}
