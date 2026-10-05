"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

type PopupProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function Popup({ isOpen, onClose, children }: PopupProps) {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div
        className="popup"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="popup__close"
          onClick={onClose}
          aria-label="Close popup"
        >
          <X className="icon" />
        </button>

        {children}
      </div>
    </div>
  );
}
