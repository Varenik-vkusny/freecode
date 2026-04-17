"use client";

import { useState } from "react";
import styles from "./OnboardingModal.module.css";
import { EyeIcon, EyeOffIcon, CopyIcon } from "./Icons";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (apiKey: string) => void;
  initialApiKey?: string;
}

export default function OnboardingModal({
  isOpen,
  onComplete,
  initialApiKey = "",
}: OnboardingModalProps) {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showKey, setShowKey] = useState(false);

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
  };

  const handleComplete = async () => {
    if (!apiKey.trim()) {
      setError("API Key is required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onComplete(apiKey);
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
              Settings will be saved in the application directory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

