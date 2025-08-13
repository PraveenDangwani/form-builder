import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { KeyboardCoordinateGetter, UniqueIdentifier } from "@dnd-kit/core";
import { useCallback } from "react";

export function useKeyboardCoordinates(
  fields: { id: string }[],
  lastKbdOverRef: React.MutableRefObject<string | null>
): KeyboardCoordinateGetter {
  return useCallback<KeyboardCoordinateGetter>((event, { currentCoordinates, context, active }) => {
    const code = event.code;
    if (!code?.startsWith("Arrow")) return currentCoordinates;

    const activeId = String(active);
    const isPalette = activeId.startsWith("palette-");

    const centerOf = (id: UniqueIdentifier) => {
      const rect = context.droppableRects.get(id);
      return rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null;
    };

    const getOverIdAt = (pt: { x: number; y: number }): string | null => {
      for (const [id, rect] of context.droppableRects) {
        if (pt.x >= rect.left && pt.x <= rect.right && pt.y >= rect.top && pt.y <= rect.bottom) {
          return String(id);
        }
      }
      return null;
    };

    let next = currentCoordinates;

    if (isPalette) {
      if (code === "ArrowRight" || code === "ArrowDown") {
        const overNow = getOverIdAt(currentCoordinates);
        if (!overNow) next = centerOf("canvas") ?? next;
      }

      const overNext = getOverIdAt(next);

      if (overNext === "canvas" && fields.length > 0) {
        if (code === "ArrowDown" || code === "ArrowRight") {
          next = centerOf(fields[0].id) ?? next;
        } else if (code === "ArrowUp" || code === "ArrowLeft") {
          next = centerOf(fields[fields.length - 1].id) ?? next;
        }
      }

      const idx = fields.findIndex((f) => f.id === overNext);
      if (idx !== -1) {
        if (code === "ArrowDown" && idx < fields.length - 1) {
          next = centerOf(fields[idx + 1].id) ?? next;
        } else if (code === "ArrowUp" && idx > 0) {
          next = centerOf(fields[idx - 1].id) ?? next;
        }
      }

      const finalOver = getOverIdAt(next);
      if (finalOver) lastKbdOverRef.current = finalOver;

      return next;
    }

    const sortableNext = sortableKeyboardCoordinates(event, { currentCoordinates, context, active });
    if (sortableNext) {
      const finalOver = getOverIdAt(sortableNext);
      if (finalOver) lastKbdOverRef.current = finalOver;
      return sortableNext;
    }

    return currentCoordinates;
  }, [fields, lastKbdOverRef]);
}
