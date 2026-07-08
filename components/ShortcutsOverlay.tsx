"use client";

import { useEffect, useRef } from "react";
import { useFocusTrap } from "@/lib/useFocusTrap";

type ShortcutsOverlayProps = {
  open: boolean;
  onClose: () => void;
};

const shortcuts = [
  ["?", "open shortcuts"],
  ["J", "start the judge briefing"],
  ["Esc", "close overlay or story card"],
  ["Left / Right", "step replay"],
  ["Space", "play or pause replay"],
  ["f", "toggle failures only"],
];

export default function ShortcutsOverlay({
  open,
  onClose,
}: ShortcutsOverlayProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useFocusTrap(dialogRef, open);

  useEffect(() => {
    if (!open) return;

    openerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus({ preventScroll: true });

    return () => {
      openerRef.current?.focus({ preventScroll: true });
      openerRef.current = null;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 grid place-items-center bg-bg/90 px-4 font-mono text-text"
      data-testid="shortcuts-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      tabIndex={-1}
    >
      <div className="w-full max-w-md border border-border bg-surface p-4">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-sm tracking-[0.2em] text-muted">
            SHORTCUTS
          </h2>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close keyboard shortcuts"
            onClick={onClose}
            className="border border-border bg-bg px-2 py-1 text-xs text-accent focus:outline-1 focus:outline-accent"
          >
            close
          </button>
        </div>
        <dl className="mt-4 grid grid-cols-[7rem_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
          {shortcuts.map(([key, action]) => (
            <div key={key} className="contents">
              <dt className="text-accent">{key}</dt>
              <dd className="text-muted">{action}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
