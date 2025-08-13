"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Field } from "@/lib/types";

import RenderField from "@/components/render-field";

type Awaitable<T> = T | Promise<T>;


export default function FieldCard({
  field,
  index,
  landing,
  onEdit,
  onRequestDelete,
}: {
  field: Field;
  index: number;
  landing: boolean;
  onEdit: (id: string) => void;
  onRequestDelete: (id: string, label: string) => Awaitable<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: field.id,
      data: { kind: "FIELD", id: field.id, fromIndex: index },
    });

  const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`mx-4 rounded border bg-white p-4 transition-shadow
        ${isDragging ? "shadow-lg ring-2 ring-blue-500" : "hover:bg-gray-50"}
        ${landing ? "ring-2 ring-blue-500 animate-pulse" : ""}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-6 w-6 items-center justify-center rounded border text-xs select-none
                       cursor-grab active:cursor-grabbing"
            aria-label="Drag to reorder"
            {...listeners}
            {...attributes}
          >
            ☰
          </button>
          <div className="text-sm font-medium">{field.label}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
            onClick={() => onEdit(field.id)}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onRequestDelete(field.id, field.label)}
            className="rounded border px-2 py-1 text-xs hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete ${field.label}`}
          >
            Delete
          </button>
        </div>
      </div>

      {/* ▶️ keep the preview INSIDE the card */}
      <RenderField field={field} disabled />
    </li>
  );
}

