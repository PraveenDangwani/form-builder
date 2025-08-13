// src/components/render-field.tsx
"use client";

import type { Field } from "@/lib/types";
import { htmlConstraintsFor } from "@/lib/validation";

export default function RenderField({
  field,
  disabled,
  value,
  onChange,
}: {
  field: Field;
  disabled?: boolean;
  value?: unknown;
  onChange?: (v: unknown) => void;
}) {
  const attrs = htmlConstraintsFor(field);
  const common =
    "block w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

  const isControlled = typeof onChange === "function";

  switch (field.type) {
    case "textarea":
      return isControlled ? (
        <textarea
          className={common}
          placeholder={field.placeholder || ""}
          disabled={disabled}
          value={(value as string) ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          {...attrs}
          rows={3}
        />
      ) : (
        <textarea
          className={common}
          placeholder={field.placeholder || ""}
          disabled={disabled}
          defaultValue=""
          {...attrs}
          rows={3}
        />
      );

    case "number":
      return isControlled ? (
        <input
          type="number"
          className={common}
          placeholder={field.placeholder || ""}
          disabled={disabled}
          value={value as number | string | undefined ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          {...attrs}
        />
      ) : (
        <input
          type="number"
          className={common}
          placeholder={field.placeholder || ""}
          disabled={disabled}
          {...attrs}
        />
      );

    case "email":
      return isControlled ? (
        <input
          type="email"
          className={common}
          placeholder={field.placeholder || "name@example.com"}
          disabled={disabled}
          value={(value as string) ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          {...attrs}
        />
      ) : (
        <input
          type="email"
          className={common}
          placeholder={field.placeholder || "name@example.com"}
          disabled={disabled}
          {...attrs}
        />
      );

    case "select": {
      const opts = field.options || [];
      return isControlled ? (
        <select
          className={common}
          disabled={disabled}
          value={(value as string) ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
        >
          <option value="" disabled>
            {field.placeholder || "Select…"}
          </option>
          {opts.map((o) => (
            <option key={o.id} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <select className={common} disabled={disabled}>
          <option value="" disabled selected>
            {field.placeholder || "Select…"}
          </option>
          {opts.map((o) => (
            <option key={o.id} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }

    case "radio": {
      const opts = field.options || [];
      return (
        <div className="space-y-2">
          {opts.map((o) => (
            <label key={o.id} className="flex items-center gap-2 text-sm">
              {isControlled ? (
                <input
                  type="radio"
                  name={field.id}
                  disabled={disabled}
                  checked={value === o.value}
                  onChange={() => onChange?.(o.value)}
                />
              ) : (
                <input type="radio" name={field.id} disabled={disabled} />
              )}
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      );
    }

    case "checkbox":
      return isControlled ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            disabled={disabled}
            checked={!!value}
            onChange={(e) => onChange?.(e.target.checked)}
          />
          <span>{field.label}</span>
        </label>
      ) : (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" disabled={disabled} />
          <span>{field.label}</span>
        </label>
      );

    case "text":
    default:
      return isControlled ? (
        <input
          type="text"
          className={common}
          placeholder={field.placeholder || "Type here…"}
          disabled={disabled}
          value={(value as string) ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          {...attrs}
        />
      ) : (
        <input
          type="text"
          className={common}
          placeholder={field.placeholder || "Type here…"}
          disabled={disabled}
          {...attrs}
        />
      );
  }
}
