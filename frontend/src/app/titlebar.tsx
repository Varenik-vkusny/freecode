"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function TitleBar() {
  const [mode, setMode] = useState<"tauri" | "browser" | "unknown">("unknown");
  const [maximized, setMaximized] = useState(false);
  const [appWindow, setAppWindow] = useState<any>(null);

  useEffect(() => {
    // Check if running in Tauri
    const isTauri = !!(window as any).__TAURI_INTERNALS__;
    
    if (isTauri) {
      import("@tauri-apps/api/window").then((mod) => {
        const win = mod.getCurrentWindow();
        setAppWindow(win);
        setMode("tauri");
        
        // Listen for resize events to update maximized state
        win.isMaximized().then(setMaximized);
        const unlisten = win.onResized(() => {
          win.isMaximized().then(setMaximized);
        });
        return () => { unlisten.then(fn => fn()); };
      });
    } else {
      setMode("browser");
    }
  }, []);

  if (mode === "unknown") return null;

  const handleMinimize = () => { appWindow?.minimize(); };
  const handleMaximize = () => {
    appWindow?.toggleMaximize();
    // State will be updated via the resize listener
  };
  const handleClose = () => { appWindow?.close(); };

  return (
    <div className="titlebar" data-tauri-drag-region>
      {/* Drag region + app identity */}
      <div className="titlebar-drag" style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", pointerEvents: "none" }}>
        <Image src="/logo.svg" width={12} height={12} alt="" style={{ opacity: 0.3 }} />
        <span style={{ color: "var(--dim3)", fontSize: 10, letterSpacing: "0.12em", textTransform: "lowercase", fontFamily: "inherit" }}>
          freecode
        </span>
      </div>

      {/* Window controls — only shown in tauri */}
      {mode === "tauri" && (
        <div className="titlebar-controls">
          {/* Minimize */}
          <button
            className="tb-btn tb-min"
            title="Minimize"
            onClick={handleMinimize}
          >
            <svg width="10" height="1" viewBox="0 0 10 1">
              <rect width="10" height="1" fill="currentColor" />
            </svg>
          </button>

          {/* Maximize / Restore */}
          <button
            className="tb-btn tb-max"
            title={maximized ? "Restore" : "Maximize"}
            onClick={handleMaximize}
          >
            {maximized ? (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M3,1 L9,1 L9,7 M1,3 L7,3 L7,9 L1,9 Z" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <rect x="1" y="1" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            )}
          </button>

          {/* Close */}
          <button
            className="tb-btn tb-close"
            title="Close"
            onClick={handleClose}
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1.2" />
              <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
