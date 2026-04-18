const API_KEY_KEY = "freecode:api_key";
const BACKEND_HTTP = (process.env.NEXT_PUBLIC_BACKEND_URL || "ws://127.0.0.1:47820").replace(/^ws/, "http");

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

export async function sendConfigToBackend(apiKey: string): Promise<boolean> {
  // Always persist locally first so the key is never lost
  saveApiKey(apiKey);
  try {
    const response = await fetch(`${BACKEND_HTTP}/api/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey }),
    });
    return response.ok;
  } catch {
    // Backend not reachable — key is still in localStorage and will be sent on next WS connect
    return false;
  }
}
