"use client";

import React from "react";

interface PopoverProps {
  onClose?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function Popover({ onClose, className = "", children }: PopoverProps) {
  return (
    <>
      <div className="popover-backdrop" onClick={onClose} />
      <div className={`popover-panel ${className}`}>
        {children}
      </div>
    </>
  );
}
