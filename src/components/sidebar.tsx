"use client";

import { PALETTE, FieldType } from "@/lib/types";
import { useDraggable } from "@dnd-kit/core";

function DraggablePaletteItem({ type, label }: { type: FieldType; label: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { kind: "PALETTE", type },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      // Focusable for keyboard-based drag; users can press Space/Enter to pick up (with KeyboardSensor enabled in DndContext)
      tabIndex={0}
      role="button"
      aria-label={`Drag ${label} to canvas`}
      className={`flex items-center justify-between rounded-lg border px-3 py-2
                  text-sm text-gray-800 bg-white cursor-grab active:cursor-grabbing
                  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${isDragging ? "opacity-60" : ""}`}
    >
      <span className="font-medium">{label}</span>
      <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded border text-xs select-none">
        ☰
      </span>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r bg-white">
      <div className="p-4">
        <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Components
        </h2>
        <div className="mt-3 space-y-2">
          {PALETTE.map((p) => (
            <DraggablePaletteItem key={p.type} type={p.type} label={p.label} />
          ))}
        </div>
      </div>
    </aside>
  );
}
