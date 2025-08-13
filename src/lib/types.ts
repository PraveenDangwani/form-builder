// src/lib/types.ts

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "number"
  | "email";

export interface FieldOption {
  id: string;
  label: string;
  value: string;
}

export type TextValidation = {
  minLength?: number;
  maxLength?: number;
  pattern?: string; // JS regex source, e.g. "^[A-Za-z]+$"
  message?: string; // custom message shown on error
};

export type NumberValidation = {
  min?: number;
  max?: number;
  step?: number;
  message?: string;
};

export type FieldValidation =
  | TextValidation
  | NumberValidation; // other types can stay empty for now


export interface Field {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[]; // select/radio only
  validation?: FieldValidation;
}

export type BuilderMode = "builder" | "preview";

/** Safe uuid for both browser and node (Next SSR). */
export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Quick fallback (not cryptographically strong, fine for UI ids)
  return `id_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

/** Factory: create a minimally useful field for the given type. */
export function createEmptyField(type: FieldType): Field {
  switch (type) {
    case "select":
    case "radio": {
      const o1: FieldOption = { id: uid(), label: "Option 1", value: "option-1" };
      const o2: FieldOption = { id: uid(), label: "Option 2", value: "option-2" };
      return {
        id: uid(),
        type,
        label: type === "select" ? "Select" : "Radio",
        required: false,
        options: [o1, o2],
      };
    }
    case "checkbox":
      return { id: uid(), type, label: "Checkbox", required: false };
    case "textarea":
      return { id: uid(), type, label: "Long Answer", placeholder: "Type here…" };
    case "number":
      return { id: uid(), type, label: "Number", placeholder: "0" };
    case "email":
      return { id: uid(), type, label: "Email", placeholder: "name@example.com" };
    case "text":
    default:
      return { id: uid(), type: "text", label: "Short Answer", placeholder: "Type here…" };
  }
}

/** Palette used by the Sidebar */
export const PALETTE: ReadonlyArray<{ type: FieldType; label: string; hint?: string }> = [
  { type: "text", label: "Text" },
  { type: "textarea", label: "Textarea" },
  { type: "select", label: "Select" },
  { type: "radio", label: "Radio Group" },
  { type: "checkbox", label: "Checkbox" },
  { type: "number", label: "Number" },
  { type: "email", label: "Email" },
];


