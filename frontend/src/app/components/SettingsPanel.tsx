"use client";
 
import { useState, useEffect } from "react";
import styles from "./SettingsPanel.module.css";
import { getApiKey, saveApiKey, getSettingsFolder, saveSettingsFolder, sendConfigToBackend } from "../lib/config";
 
interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onBrowseSettings?: () => Promise<string>;
}
 
export default function SettingsPanel({ isOpen, onClose, onBrowseSettings }: SettingsPanelProps) {
  const [apiKey, setApiKey] = useState("");
  const [settingsFolder, setSettingsFolder] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getApiKey() || "");
      setSettingsFolder(getSettingsFolder() || "");
      setError("");
      setSuccess("");
    }
  }, [isOpen]);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setSuccess("API Key copied!");
    setTimeout(() => setSuccess(""), 2000);
  };

  const handleBrowse = async () => {
    if (onBrowseSettings) {
      const path = await onBrowseSettings();
      if (path) setSettingsFolder(path);
    }
  };
 
  const handleSave = async () => {
    setError("");
    setSuccess("");
 
    if (!apiKey.trim()) {
      setError("API Key is required");
      return;
    }
 
    if (!settingsFolder.trim()) {
      setError("Settings folder is required");
      return;
    }
 
    const success = await sendConfigToBackend(apiKey, settingsFolder);
    if (success) {
      saveApiKey(apiKey);
      saveSettingsFolder(settingsFolder);
      setSuccess("Settings saved!");
      setTimeout(onClose, 1000);
    } else {
      setError("Failed to save settings");
    }
  };
 
  if (!isOpen) return null;
 
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Settings</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
 
        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.labelRow}>
                <label className={styles.label}>API Key</label>
                <div className={styles.keyActions}>
                    <button onClick={() => setShowKey(!showKey)} className={styles.actionLink}>
                        {showKey ? "Hide" : "Show"}
                    </button>
                    <button onClick={handleCopyKey} className={styles.actionLink}>Copy</button>
                </div>
            </div>
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className={styles.input}
              placeholder="Enter your API key..."
            />
          </div>
 
          <div className={styles.section}>
            <label className={styles.label}>Settings Folder</label>
            <div className={styles.row}>
                <input
                    type="text"
                    value={settingsFolder}
                    onChange={(e) => setSettingsFolder(e.target.value)}
                    className={styles.input}
                />
                <button onClick={handleBrowse} className={styles.browseBtn}>Browse</button>
            </div>
          </div>
 
          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}
 
          <div className={styles.buttons}>
            <button onClick={onClose} className={styles.buttonSecondary}>
              Cancel
            </button>
            <button onClick={handleSave} className={styles.buttonPrimary}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
