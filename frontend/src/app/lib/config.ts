// Configuration helpers for API key
const API_KEY_KEY = "freecode:api_key";

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

export function hasOnboarded(): boolean {
  return !!getApiKey();
}

export async function getConfigFromBackend(): Promise<{ api_key?: string; working_dir?: string } | null> {
  // Try to fetch from backend API
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
  apiKey: string
): Promise<boolean> {
  // Always send to backend API
  try {
    const response = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey }),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to send config to backend:", error);
    return false;
  }
}

