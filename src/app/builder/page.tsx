"use client";

import Sidebar from "@/components/sidebar";
import Canvas from "@/components/canvas";
import { useFormStore } from "@/lib/store";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverlay,
  pointerWithin,
  // type KeyboardCoordinateGetter,
  // type UniqueIdentifier,
} from "@dnd-kit/core";
// import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { DragData } from "@/lib/dnd";
import { useRef, useState } from "react";
import { useKeyboardCoordinates } from "@/hooks/useKeyboardCoordinates";


type ActiveDrag =
  | { kind: "PALETTE"; label: string }
  | { kind: "FIELD"; label: string }
  | null;

export default function BuilderPage() {
  const addField = useFormStore((s) => s.addField);
  const moveField = useFormStore((s) => s.moveField);
  const fields   = useFormStore((s) => s.fields);

  const [active, setActive] = useState<ActiveDrag>(null);
  const [forceConfigId, setForceConfigId] = useState<string | null>(null);

  const getIndexById = (id: string) => fields.findIndex((f) => f.id === id);

  /* NEW: remember last keyboard 'over' droppable id as a fallback */
  const lastKbdOverRef = useRef<string | null>(null);

//   const keyboardCoordinates: KeyboardCoordinateGetter = (
//     event,
//     { currentCoordinates, context, active }
//   ) => {
//     const code = event.code;
//     if (!code?.startsWith("Arrow")) return currentCoordinates;
  
//     const activeId = String(active);
//     const isPalette = activeId.startsWith("palette-");
  
//     const centerOf = (id: UniqueIdentifier) => {
//       const rect = context.droppableRects.get(id);
//       if (!rect) return null;
//       return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
//     };
  
//     const getOverIdAt = (pt: { x: number; y: number }): string | null => {
//       for (const [id, rect] of context.droppableRects) {
//         if (pt.x >= rect.left && pt.x <= rect.right && pt.y >= rect.top && pt.y <= rect.bottom) {
//           return String(id);
//         }
//       }
//       return null;
//     };
  
//     // ---------- Compute NEXT coordinates first ----------
//     let next = currentCoordinates;
  
//     if (isPalette) {
//       // From nowhere -> jump to canvas
//       if (code === "ArrowRight" || code === "ArrowDown") {
//         const overNow = getOverIdAt(currentCoordinates);
//         if (!overNow) {
//           const toCanvas = centerOf("canvas");
//           if (toCanvas) next = toCanvas;
//         }
//       }
  
//       const overNext = getOverIdAt(next);
  
//       // From canvas -> first/last field
//       if (overNext === "canvas" && fields.length > 0) {
//         if (code === "ArrowDown" || code === "ArrowRight") {
//           next = centerOf(fields[0].id) ?? next;
//         } else if (code === "ArrowUp" || code === "ArrowLeft") {
//           next = centerOf(fields[fields.length - 1].id) ?? next;
//         }
//       }
  
//       // From a field -> move among fields
//       const idx = fields.findIndex((f) => f.id === overNext);
//       if (idx !== -1) {
//         if (code === "ArrowDown" && idx < fields.length - 1) {
//           next = centerOf(fields[idx + 1].id) ?? next;
//         } else if (code === "ArrowUp" && idx > 0) {
//           next = centerOf(fields[idx - 1].id) ?? next;
//         }
//       }
  
//       // After deciding NEXT, record the droppable under it
//       const finalOver = getOverIdAt(next);
//       if (finalOver) lastKbdOverRef.current = finalOver;
  
//       return next;
//     }
  
//     // Existing FIELD reorder: use dnd-kit's default, but still record the over target at the NEXT coords
//     // const sortableNext = sortableKeyboardCoordinates(event, { currentCoordinates, context, active });
//     // const finalOver = getOverIdAt(sortableNext);
//     // if (finalOver) lastKbdOverRef.current = finalOver;
//     // return sortableNext;
//     // Existing FIELD reorder: use dnd-kit's default, but still record the over target at the NEXT coords
// const sortableNext = sortableKeyboardCoordinates(event, { currentCoordinates, context, active });

// // Only try to detect droppable if we actually have coordinates
// if (sortableNext) {
//   const finalOver = getOverIdAt(sortableNext);
//   if (finalOver) lastKbdOverRef.current = finalOver;
// }

// return sortableNext ?? currentCoordinates;

//   };

const keyboardCoordinates = useKeyboardCoordinates(fields, lastKbdOverRef);  
const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: keyboardCoordinates })
  );

  function onDragStart(e: DragStartEvent) {
    const data = e.active.data.current as DragData | undefined;
    if (!data) return;
    if (data.kind === "PALETTE") setActive({ kind: "PALETTE", label: data.type });
    if (data.kind === "FIELD") {
      const i = getIndexById(data.id);
      setActive({ kind: "FIELD", label: i >= 0 ? fields[i].label : "" });
    }
  }

  function onDragEnd(e: DragEndEvent) {
    const data = e.active.data.current as DragData | undefined;
    // Fallback: if e.over is null (common with keyboard), use lastKbdOverRef
    let overId = (e.over?.id ?? null) as string | null;
    if (!overId) overId = lastKbdOverRef.current;
    setActive(null);

    if (!data) return;

    const fieldIds = fields.map((f) => f.id);
    const validTargets = new Set<string>(["canvas", ...fieldIds]);

    if (data.kind === "PALETTE") {
      if (!overId || !validTargets.has(overId)) return;

      if (overId === "canvas") {
        const newId = addField(data.type);          // append
        setForceConfigId(newId);
        return;
      }
      const toIndex = getIndexById(overId);
      if (toIndex !== -1) {
        const newId = addField(data.type, toIndex); // insert before card
        setForceConfigId(newId);
      }
      return;
    }

    if (data.kind === "FIELD") {
      if (!overId || overId === "canvas") return;
      const from = getIndexById(data.id);
      const to   = getIndexById(overId);
      if (from !== -1 && to !== -1 && from !== to) moveField(from, to);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActive(null)}
      accessibility={{
        announcements: {
          onDragStart({ active }) {
            return `Picked up ${String(active.id)}. Use arrow keys to move, space to drop.`;
          },
          onDragOver({ active, over }) {
            if (!over) return;
            return `Moving ${String(active.id)} over ${String(over.id)}.`;
          },
          onDragEnd({ active, over }) {
            if (!over) return `Dropped ${String(active.id)}.`;
            return `Dropped ${String(active.id)} on ${String(over.id)}.`;
          },
          onDragCancel({ active }) {
            return `Cancelled dragging ${String(active.id)}.`;
          },
        },
        screenReaderInstructions: {
          draggable:
            "To pick up an item, press space. Use the arrow keys to move it. Press space again to drop.",
        },
      }}
    >
      <div className="flex h-screen">
        <Sidebar />
        <Canvas
          forceOpenConfigForId={forceConfigId}
          onConfigHandled={() => setForceConfigId(null)}
        />
      </div>

      {/* NEW: disable the snap-back animation */}
      <DragOverlay dropAnimation={null}>
        {active ? (
          <div className="rounded-md border bg-white px-3 py-2 text-sm shadow-md min-w-[180px]">
            <div className="mb-1 text-xs text-gray-500">Field</div>
            <div className="font-medium">{active.label}</div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
