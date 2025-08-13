"use client";

import { useEffect, useRef } from "react";

export default function DeleteConfirm({
  open,
  title = "Delete this field?",
  desc = "Are you sure you want to delete this element?",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  desc?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => boxRef.current?.focus());
    return () => prev?.focus();
  }, [open]);

  if (!open) return null;

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      onConfirm();
    }
    if (e.key === "Tab") {
      const root = boxRef.current;
      if (!root) return;
      const items = Array.from(
        root.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')
      ).filter((el) => !el.hasAttribute("disabled"));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const cur = document.activeElement as HTMLElement | null;
      if (!e.shiftKey && cur === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && cur === first) {
        e.preventDefault();
        last.focus();
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
      <div ref={boxRef} tabIndex={-1} className="w-[min(420px,92vw)] rounded-lg bg-white p-4 shadow-lg" onKeyDown={onKeyDown}>
        <h3 className="mb-1 text-base font-semibold">{title}</h3>
        {desc ? <p className="mb-3 text-sm text-gray-600">{desc}</p> : null}
        <div className="flex justify-end gap-2">
          <button className="rounded border px-3 py-1 text-sm hover:bg-gray-50" onClick={onCancel}>
            Cancel
          </button>
          <button className="rounded border px-3 py-1 text-sm bg-red-600 text-white hover:bg-red-700" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
