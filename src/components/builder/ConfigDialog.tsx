"use client";

import { useEffect, useRef } from "react";
import { useFormStore } from "@/lib/store";

const inputBase =
  "block w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

const slug = (s: string) =>
  s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");

export default function ConfigDialog({
  fieldId,
  open,
  onClose,
}: {
  fieldId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const field = useFormStore((s) => s.fields.find((f) => f.id === fieldId));
  const updateField = useFormStore((s) => s.updateField);
  const initialFocusRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) requestAnimationFrame(() => initialFocusRef.current?.focus());
  }, [open]);

  if (!open || !field) return null;

  const id = field.id;
  const isChoice = field.type === "select" || field.type === "radio";
  const options = field.options ?? [];

  const addOption = () => {
    const base = `Option ${options.length + 1}`;
    const oid = `${Date.now()}`;
    updateField(id, { options: [...options, { id: oid, label: base, value: slug(base) }] });
  };

  const removeOption = (oid: string) => {
    updateField(id, { options: options.filter((o) => o.id !== oid) });
  };

  const updateOptionLabel = (oid: string, newLabel: string) => {
    updateField(id, {
      options: options.map((o) => (o.id === oid ? { ...o, label: newLabel, value: slug(newLabel) } : o)),
    });
  };

  const showPlaceholder =
    field.type === "text" || field.type === "textarea" || field.type === "number" || field.type === "email";

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[min(560px,92vw)] rounded-lg bg-white p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold">Field settings</h3>
          <button
            type="button"
            className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
            onClick={onClose}
            aria-label="Close"
          >
            Done
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-800">Label</span>
            <input
              ref={initialFocusRef}
              className={inputBase}
              value={field.label}
              onChange={(e) => updateField(id, { label: e.target.value })}
            />
          </label>

          {showPlaceholder && (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-800">Placeholder</span>
              <input
                className={inputBase}
                value={field.placeholder || ""}
                onChange={(e) => updateField(id, { placeholder: e.target.value })}
              />
            </label>
          )}

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              checked={!!field.required}
              onChange={(e) => updateField(id, { required: e.target.checked })}
            />
            <span className="text-sm text-gray-800">Required</span>
          </label>

          {isChoice && (
            <div className="mt-2">
              <div className="mb-2 text-sm font-medium text-gray-800">Options</div>
              <div className="space-y-2">
                {options.map((o) => (
                  <div key={o.id} className="grid grid-cols-[1fr_auto] gap-2">
                    <input
                      className={inputBase}
                      value={o.label}
                      onChange={(e) => updateOptionLabel(o.id, e.target.value)}
                      placeholder="Option label"
                    />
                    <button
                      type="button"
                      className="rounded border px-2 text-xs hover:bg-red-50 hover:text-red-600"
                      onClick={() => removeOption(o.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="mt-2 rounded border px-3 py-1 text-sm hover:bg-gray-50" onClick={addOption}>
                + Add option
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
