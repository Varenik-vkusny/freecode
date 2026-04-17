"use client";

import { useState } from "react";
import styles from "./OnboardingModal.module.css";
import { EyeIcon, EyeOffIcon, CopyIcon, FolderIcon } from "./Icons";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (apiKey: string, settingsFolder: string) => void;
  onBrowse?: () => Promise<string>;
  initialApiKey?: string;
  initialSettingsFolder?: string;
}

function getDefaultSettingsFolder(): string {
  if (typeof window === "undefined") return "~/.freecode";
  // Try to detect OS from userAgent
  const isWindows = navigator.userAgent.includes("Windows");
  if (isWindows) {
    return "%USERPROFILE%\\.freecode";
  }
  return "~/.freecode";
}

export default function OnboardingModal({
  isOpen,
  onComplete,
  onBrowse,
  initialApiKey = "",
  initialSettingsFolder = "",
}: OnboardingModalProps) {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [settingsFolder, setSettingsFolder] = useState(
    initialSettingsFolder || getDefaultSettingsFolder()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [browsing, setBrowsing] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
  };

  const handleBrowse = async () => {
    if (!onBrowse) return;
    setBrowsing(true);
    try {
      const path = await onBrowse();
      if (path) setSettingsFolder(path);
    } finally {
      setBrowsing(false);
    }
  };

  const handleComplete = async () => {
    if (!apiKey.trim()) {
      setError("API Key is required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onComplete(apiKey, settingsFolder);
    } catch (e: any) {
      setError(e.message || "Failed to save configuration");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.onboardingHeader}>
          <h2 className={styles.title}>Welcome to FreeCode</h2>
          <p className={styles.subtitle}>Let's get you set up in seconds.</p>
        </div>

        <div className={styles.step}>
          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
                <label className={styles.label}>Gemini API Key</label>
                <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className={styles.link}>
                  Get Key →
                </a>
            </div>
            <div className={styles.inputWrapper}>
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleComplete()}
                  placeholder="Paste your API key here..."
                  className={styles.inputWithIcons}
                  autoFocus
                />
                <div className={styles.inputIconsWrapper}>
                    <button onClick={() => setShowKey(!showKey)} className={styles.iconBtn} type="button" title={showKey ? "Hide" : "Show"}>
                        {showKey ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                    <button onClick={copyKey} className={styles.iconBtn} type="button" title="Copy">
                        <CopyIcon />
                    </button>
                </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Settings Folder</label>
            <p className={styles.description}>
              Where FreeCode stores your config and session history.
            </p>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                value={settingsFolder}
                onChange={(e) => setSettingsFolder(e.target.value)}
                placeholder="~/.freecode"
                className={styles.inputWithIcons}
              />
              <div className={styles.inputIconsWrapper}>
                <button
                    onClick={handleBrowse}
                    disabled={browsing}
                    className={styles.iconBtn}
                    type="button"
                    title="Browse..."
                >
                    <FolderIcon />
                </button>
              </div>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.onboardingFooter}>
            <button 
              onClick={handleComplete} 
              className={styles.buttonPrimary}
              disabled={loading}
            >
              {loading ? "Checking..." : "Get Started →"}
            </button>
            <p className={styles.footerNote}>
              Config will be saved to {settingsFolder}/freecode.json
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
