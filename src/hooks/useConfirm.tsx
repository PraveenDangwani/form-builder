// src/hooks/useConfirm.tsx
"use client";

import { useCallback, useRef, useState } from "react";

export type ConfirmOpts = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

export default function useConfirm(defaultOpts?: ConfirmOpts) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOpts>(defaultOpts ?? {});
  const resolver = useRef<((answer: boolean) => void) | null>(null);

  const confirm = useCallback((o?: ConfirmOpts) => {
    setOpts(o ?? {});
    setOpen(true);
    return new Promise<boolean>((res) => {
      resolver.current = res;
    });
  }, []);

  const handle = (answer: boolean) => {
    setOpen(false);
    resolver.current?.(answer);
    resolver.current = null;
  };

  const Dialog = open ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-[min(420px,92vw)] rounded-lg bg-white p-4 shadow-lg">
        <h3 className="mb-1 text-base font-semibold">
          {opts.title ?? "Delete this field?"}
        </h3>
        <p className="mb-3 text-sm text-gray-600">
          {opts.description ?? "Are you sure you want to delete this element? You can undo for a few seconds."}
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
            onClick={() => handle(false)}
          >
            {opts.cancelText ?? "Cancel"}
          </button>
          <button
            className="rounded border bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
            onClick={() => handle(true)}
          >
            {opts.confirmText ?? "Delete"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, Dialog };
}
