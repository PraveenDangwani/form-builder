// src/lib/validation.ts
import type { Field } from "./types";

type BaseValidation = {
  /** Optional custom error message used when a rule fails */
  message?: string;
};

type TextValidation = BaseValidation & {
  minLength?: number;
  maxLength?: number;
  /** Regex pattern as a string (e.g. "^[A-Za-z]+$") */
  pattern?: string;
};

type NumberValidation = BaseValidation & {
  min?: number;
  max?: number;
  step?: number;
};

export function htmlConstraintsFor(field: Field) {
  const v = field.validation ?? {};

  switch (field.type) {
    case "text":
    case "textarea":
    case "email": {
      const tv = v as TextValidation;
      return {
        minLength: tv.minLength ?? undefined,
        maxLength: tv.maxLength ?? undefined,
        pattern: tv.pattern ?? undefined,
      };
    }
    case "number": {
      const nv = v as NumberValidation;
      return {
        min: nv.min ?? undefined,
        max: nv.max ?? undefined,
        step: nv.step ?? undefined,
      };
    }
    default:
      return {};
  }
}

/** Simple, synchronous validation. Returns `null` if OK, else a message. */
export function validateValue(field: Field, value: unknown): string | null {
  const v = (field.validation ?? {}) as BaseValidation;
  const msg = v.message;

  // required (applies to all)
  if (field.required) {
    const empty =
      value == null ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0) ||
      value === false;
    if (empty) return msg ?? "This field is required.";
  }

  if (field.type === "number") {
    const nv = (field.validation ?? {}) as NumberValidation;
    const num = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(num)) return msg ?? "Please enter a valid number.";
    if (nv.min != null && num < nv.min) return msg ?? `Minimum is ${nv.min}.`;
    if (nv.max != null && num > nv.max) return msg ?? `Maximum is ${nv.max}.`;
    return null;
  }

  if (field.type === "email") {
    const tv = (field.validation ?? {}) as TextValidation;
    const s = String(value ?? "");
    const pattern = tv.pattern ? new RegExp(tv.pattern) : /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(s)) return msg ?? "Please enter a valid email.";
    return null;
  }

  if (field.type === "text" || field.type === "textarea") {
    const tv = (field.validation ?? {}) as TextValidation;
    const s = String(value ?? "");
    if (tv.minLength != null && s.length < tv.minLength) {
      return msg ?? `Must be at least ${tv.minLength} characters.`;
    }
    if (tv.maxLength != null && s.length > tv.maxLength) {
      return msg ?? `Must be at most ${tv.maxLength} characters.`;
    }
    if (tv.pattern) {
      try {
        const re = new RegExp(tv.pattern);
        if (!re.test(s)) return msg ?? "Does not match the required format.";
      } catch {
        // ignore invalid regex strings
      }
    }
    return null;
  }

  // select/radio/checkbox — nothing special beyond `required` for now
  return null;
}
