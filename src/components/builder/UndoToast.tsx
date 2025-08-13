"use client";

import { useEffect } from "react";

export default function UndoToast({
  message,
  show,
  onUndo,
  onClose,
  duration = 5000,
}: {
  message: string;
  show: boolean;
  onUndo: () => void;
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-md border bg-white px-4 py-2 shadow">
        <span className="text-sm">{message}</span>
        <button className="rounded border px-2 py-1 text-xs hover:bg-gray-50" onClick={onUndo} aria-label="Undo delete">
          Undo
        </button>
      </div>
    </div>
  );
}
