// import { create } from "zustand";

// interface Field {
//   id: string;
//   type: "text" | "textarea" | "select";
//   label: string;
//   required: boolean;
// }

// interface FormState {
//   fields: Field[];
//   addField: (field: Field) => void;
// }

// export const useFormStore = create<FormState>((set) => ({
//   fields: [],
//   addField: (field) => set((state) => ({ fields: [...state.fields, field] })),
// }));



// src/lib/store.ts
"use client";

import { create } from "zustand";
import { Field, FieldType, BuilderMode, createEmptyField } from "@/lib/types";

type RemovedBuffer = { field: Field; index: number } | null;

type FormState = {
  fields: Field[];
  selectedFieldId: string | null;
  mode: BuilderMode;
  lastAddedId: string | null;

  // undo buffer
  lastRemoved: RemovedBuffer;

  addField: (type: FieldType, index?: number) => string;
  moveField: (fromIndex: number, toIndex: number) => void;
  updateField: (id: string, patch: Partial<Field>) => void;

  /** soft delete (moves to undo buffer) */
  deleteField: (id: string) => void;

  /** restores from undo buffer to original index */
  undoRemove: () => void;

  /** clears undo buffer */
  clearLastRemoved: () => void;

  selectField: (id: string | null) => void;
  setMode: (mode: BuilderMode) => void;
  getFieldIndex: (id: string) => number;
  getSelected: () => Field | null;

  clearLastAdded: () => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export const useFormStore = create<FormState>((set, get) => ({
  fields: [],
  selectedFieldId: null,
  mode: "builder",
  lastAddedId: null,
  lastRemoved: null,

  addField: (type, index) => {
    const next = createEmptyField(type);
    set((state) => {
      if (index == null || index < 0 || index > state.fields.length) {
        return {
          fields: [...state.fields, next],
          selectedFieldId: next.id,
          lastAddedId: next.id,
        };
      }
      const copy = state.fields.slice();
      copy.splice(index, 0, next);
      return { fields: copy, selectedFieldId: next.id, lastAddedId: next.id };
    });
    return next.id;
  },

  moveField: (from, to) =>
    set((state) => {
      if (from === to || from < 0 || to < 0 || from >= state.fields.length || to >= state.fields.length) return {};
      const arr = state.fields.slice();
      const [item] = arr.splice(from, 1);
      arr.splice(clamp(to, 0, arr.length), 0, item);
      return { fields: arr };
    }),

  updateField: (id, patch) =>
    set((state) => {
      const i = state.fields.findIndex((f) => f.id === id);
      if (i === -1) return {};
      const arr = state.fields.slice();
      arr[i] = { ...arr[i], ...patch };
      return { fields: arr };
    }),

  deleteField: (id) =>
    set((state) => {
      const index = state.fields.findIndex((f) => f.id === id);
      if (index === -1) return {};
      const field = state.fields[index];
      const next = state.fields.slice();
      next.splice(index, 1);
      const selected = state.selectedFieldId === id ? null : state.selectedFieldId;
      return { fields: next, selectedFieldId: selected, lastRemoved: { field, index } };
    }),

  undoRemove: () =>
    set((state) => {
      if (!state.lastRemoved) return {};
      const { field, index } = state.lastRemoved;
      const arr = state.fields.slice();
      const safeIndex = clamp(index, 0, arr.length);
      arr.splice(safeIndex, 0, field);
      return { fields: arr, lastRemoved: null, selectedFieldId: field.id };
    }),

  clearLastRemoved: () => set({ lastRemoved: null }),

  selectField: (id) => set({ selectedFieldId: id }),
  setMode: (mode) => set({ mode }),

  getFieldIndex: (id) => get().fields.findIndex((f) => f.id === id),
  getSelected: () => {
    const { selectedFieldId, fields } = get();
    return fields.find((f) => f.id === selectedFieldId) ?? null;
  },

  clearLastAdded: () => set({ lastAddedId: null }),
}));


