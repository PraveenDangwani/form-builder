// "use client";

// import { Header } from "@/components/header";
// import { useFormStore } from "@/lib/store";
// import type { Field } from "@/lib/types";
// import { useDroppable } from "@dnd-kit/core";
// import { useEffect, useState, useRef } from "react";
// import { useSortable, SortableContext } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import PreviewOverlay from "@/components/preview";
// import RenderField from "@/components/render-field";

// /* Props to force open a specific field's config after a drop */
// type CanvasProps = {
//   forceOpenConfigForId?: string | null;
//   onConfigHandled?: () => void;
// };

// /* ----- Inputs look readable ----- */
// const inputBase =
//   "block w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

// /* small helper to generate option values from labels */
// const slug = (s: string) =>
//   s
//     .toLowerCase()
//     .trim()
//     .replace(/\s+/g, "-")
//     .replace(/[^a-z0-9-]/g, ""); // ← fix: no over-escape

// /* ===== Confirm Dialog ===== */
// function ConfirmDialog({
//   open,
//   title = "Delete this field?",
//   desc = "You can undo this action for a few seconds.",
//   onCancel,
//   onConfirm,
// }: {
//   open: boolean;
//   title?: string;
//   desc?: string;
//   onCancel: () => void;
//   onConfirm: () => void;
// }) {
//   const boxRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     if (!open) return;
//     const prev = document.activeElement as HTMLElement | null;
//     requestAnimationFrame(() => boxRef.current?.focus());
//     return () => prev?.focus();
//   }, [open]);

//   if (!open) return null;

//   function onKeyDown(e: React.KeyboardEvent) {
//     if (e.key === "Escape") {
//       e.preventDefault();
//       onCancel();
//     }
//     if (e.key === "Enter") {
//       e.preventDefault();
//       onConfirm();
//     }
//     if (e.key === "Tab") {
//       // focus trap
//       const root = boxRef.current;
//       if (!root) return;
//       const items = Array.from(
//         root.querySelectorAll<HTMLElement>(
//           'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
//         )
//       ).filter((el) => !el.hasAttribute("disabled"));
//       if (items.length === 0) return;
//       const first = items[0];
//       const last = items[items.length - 1];
//       const cur = document.activeElement as HTMLElement | null;
//       if (!e.shiftKey && cur === last) {
//         e.preventDefault();
//         first.focus();
//       } else if (e.shiftKey && cur === first) {
//         e.preventDefault();
//         last.focus();
//       }
//     }
//   }

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
//       role="dialog"
//       aria-modal="true"
//       onMouseDown={(e) => e.stopPropagation()}
//     >
//       <div
//         ref={boxRef}
//         tabIndex={-1}
//         className="w-[min(420px,92vw)] rounded-lg bg-white p-4 shadow-lg"
//         onKeyDown={onKeyDown}
//         aria-labelledby="confirm-title"
//         aria-describedby="confirm-desc"
//       >
//         <h3 id="confirm-title" className="text-base font-semibold mb-1">
//           {title}
//         </h3>
//         {desc ? (
//           <p id="confirm-desc" className="text-sm text-gray-600 mb-3">
//             {desc}
//           </p>
//         ) : null}
//         <div className="flex justify-end gap-2">
//           <button
//             className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
//             onClick={onCancel}
//           >
//             Cancel
//           </button>
//           <button
//             className="rounded border px-3 py-1 text-sm bg-red-600 text-white hover:bg-red-700"
//             onClick={onConfirm}
//           >
//             Delete
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ===== Undo Toast ===== */
// function UndoToast({
//   message,
//   show,
//   onUndo,
//   onClose,
//   duration = 5000,
// }: {
//   message: string;
//   show: boolean;
//   onUndo: () => void;
//   onClose: () => void;
//   duration?: number;
// }) {
//   useEffect(() => {
//     if (!show) return;
//     const t = setTimeout(onClose, duration);
//     return () => clearTimeout(t);
//   }, [show, duration, onClose]);

//   if (!show) return null;
//   return (
//     <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50" aria-live="polite">
//       <div className="flex items-center gap-3 rounded-md border bg-white px-4 py-2 shadow">
//         <span className="text-sm">{message}</span>
//         <button
//           className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
//           onClick={onUndo}
//           aria-label="Undo delete"
//         >
//           Undo
//         </button>
//       </div>
//     </div>
//   );
// }

// /* ===== Quick Config Dialog ===== */
// function QuickConfigDialog({
//   fieldId,
//   open,
//   onClose,
// }: {
//   fieldId: string | null;
//   open: boolean;
//   onClose: () => void;
// }) {
//   const field = useFormStore((s) => s.fields.find((f) => f.id === fieldId));
//   const updateField = useFormStore((s) => s.updateField);
//   const initialFocusRef = useRef<HTMLInputElement | null>(null);

//   useEffect(() => {
//     if (open) requestAnimationFrame(() => initialFocusRef.current?.focus());
//   }, [open]);

//   if (!open || !field) return null;

//   const id = field.id;
//   const isChoice = field.type === "select" || field.type === "radio";
//   const options = field.options ?? [];

//   const addOption = () => {
//     const base = `Option ${options.length + 1}`;
//     const oid = `${Date.now()}`;
//     updateField(id, {
//       options: [...options, { id: oid, label: base, value: slug(base) }],
//     });
//   };

//   const removeOption = (oid: string) => {
//     updateField(id, { options: options.filter((o) => o.id !== oid) });
//   };

//   const updateOptionLabel = (oid: string, newLabel: string) => {
//     updateField(id, {
//       options: options.map((o) =>
//         o.id === oid ? { ...o, label: newLabel, value: slug(newLabel) } : o
//       ),
//     });
//   };

//   const showPlaceholder =
//     field.type === "text" ||
//     field.type === "textarea" ||
//     field.type === "number" ||
//     field.type === "email"; // no placeholder for select/radio/checkbox

//   return (
//     <div
//       role="dialog"
//       aria-modal="true"
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
//     >
//       <div
//         className="w-[min(560px,92vw)] rounded-lg bg-white p-4 shadow-lg"
//         onClick={(e) => e.stopPropagation()}
//         onMouseDown={(e) => e.stopPropagation()}
//       >
//         <div className="mb-3 flex items-center justify-between">
//           <h3 className="text-base font-semibold">Field settings</h3>
//           <button
//             type="button"
//             className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
//             onClick={onClose}
//             aria-label="Close"
//           >
//             Done
//           </button>
//         </div>

//         <div className="grid grid-cols-1 gap-3">
//           <label className="block">
//             <span className="mb-1 block text-sm font-medium text-gray-800">
//               Label
//             </span>
//             <input
//               ref={initialFocusRef}
//               className={inputBase}
//               value={field.label}
//               onChange={(e) => updateField(id, { label: e.target.value })}
//             />
//           </label>

//           {showPlaceholder && (
//             <label className="block">
//               <span className="mb-1 block text-sm font-medium text-gray-800">
//                 Placeholder
//               </span>
//               <input
//                 className={inputBase}
//                 value={field.placeholder || ""}
//                 onChange={(e) => updateField(id, { placeholder: e.target.value })}
//               />
//             </label>
//           )}

//           <label className="inline-flex items-center gap-2">
//             <input
//               type="checkbox"
//               className="h-4 w-4 rounded border-gray-300"
//               checked={!!field.required}
//               onChange={(e) => updateField(id, { required: e.target.checked })}
//             />
//             <span className="text-sm text-gray-800">Required</span>
//           </label>

//           {isChoice && (
//             <div className="mt-2">
//               <div className="mb-2 text-sm font-medium text-gray-800">
//                 Options
//               </div>
//               <div className="space-y-2">
//                 {options.map((o) => (
//                   <div key={o.id} className="grid grid-cols-[1fr_auto] gap-2">
//                     <input
//                       className={inputBase}
//                       value={o.label}
//                       onChange={(e) => updateOptionLabel(o.id, e.target.value)}
//                       placeholder="Option label"
//                     />
//                     <button
//                       type="button"
//                       className="rounded border px-2 text-xs hover:bg-red-50 hover:text-red-600"
//                       onClick={() => removeOption(o.id)}
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 ))}
//               </div>
//               <button
//                 type="button"
//                 className="mt-2 rounded border px-3 py-1 text-sm hover:bg-gray-50"
//                 onClick={addOption}
//               >
//                 + Add option
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ----- Sortable field card with Edit + Request Delete ----- */
// function SortableFieldCard({
//   field,
//   index,
//   landing,
//   onEdit,
//   onRequestDelete,
// }: {
//   field: Field;
//   index: number;
//   landing: boolean;
//   onEdit: (id: string) => void;
//   onRequestDelete: (id: string) => void;
// }) {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({
//     id: field.id,
//     data: { kind: "FIELD", id: field.id, fromIndex: index },
//   });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   } as React.CSSProperties;

//   function onKeyDown(e: React.KeyboardEvent<HTMLLIElement>) {
//     if (e.key === "Delete" || e.key === "Backspace") {
//       e.preventDefault();
//       onRequestDelete(field.id);
//     }
//     if (e.key === "Enter") {
//       e.preventDefault();
//       onEdit(field.id);
//     }
//   }

//   return (
//     <li
//       ref={setNodeRef}
//       style={style}
//       tabIndex={0}
//       onKeyDown={onKeyDown}
//       className={`mx-4 rounded border bg-white p-4 transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500
//         ${isDragging ? "shadow-lg ring-2 ring-blue-500" : "hover:bg-gray-50"}
//         ${landing ? "ring-2 ring-blue-500 animate-pulse" : ""}`}
//       aria-label={`${field.label} field`}
//     >
//       <div className="mb-2 flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           {/* drag handle only */}
//           <button
//             type="button"
//             className="inline-flex h-6 w-6 items-center justify-center rounded border text-xs select-none
//                        cursor-grab active:cursor-grabbing"
//             aria-label="Drag to reorder"
//             {...listeners}
//             {...attributes}
//           >
//             ☰
//           </button>

//           <div className="text-sm font-medium">{field.label}</div>
//         </div>

//         <div className="flex items-center gap-2">
//           <button
//             type="button"
//             className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
//             onClick={() => onEdit(field.id)}
//           >
//             Edit
//           </button>
//           <button
//             type="button"
//             onClick={() => onRequestDelete(field.id)}
//             className="rounded border px-2 py-1 text-xs hover:bg-red-50 hover:text-red-600"
//             aria-label={`Delete ${field.label}`}
//           >
//             Delete
//           </button>
//         </div>
//       </div>

//       {/* Builder shows the same UI as preview, but disabled */}
//       <RenderField field={field} disabled />
//     </li>
//   );
// }

// /* ===== Canvas ===== */
// export default function Canvas({
//   forceOpenConfigForId,
//   onConfigHandled,
// }: CanvasProps) {
//   const fields = useFormStore((s) => s.fields);
//   const lastAddedId = useFormStore((s) => s.lastAddedId);
//   const clearLastAdded = useFormStore((s) => s.clearLastAdded);

//   // delete/undo APIs must exist in your store
//   const deleteField = useFormStore((s) => s.deleteField);
//   const lastRemoved = useFormStore((s) => s.lastRemoved);
//   const undoRemove = useFormStore((s) => s.undoRemove);
//   const clearLastRemoved = useFormStore((s) => s.clearLastRemoved);

//   const { setNodeRef, isOver } = useDroppable({ id: "canvas" });

//   const [landingId, setLandingId] = useState<string | null>(null);
//   const [configId, setConfigId] = useState<string | null>(null);

//   // delete confirm + undo toast
//   const [confirmId, setConfirmId] = useState<string | null>(null);
//   const [showUndo, setShowUndo] = useState(false);

//   const mode = useFormStore((s) => s.mode);
//   const setMode = useFormStore((s) => s.setMode);

//   // Open after explicit id from BuilderPage (robust for inserts)
//   useEffect(() => {
//     if (!forceOpenConfigForId) return;
//     const t = setTimeout(() => {
//       setConfigId(forceOpenConfigForId);
//       onConfigHandled?.();
//     }, 60);
//     return () => clearTimeout(t);
//   }, [forceOpenConfigForId, onConfigHandled]);

//   // Keep landing pulse
//   useEffect(() => {
//     if (!lastAddedId) return;
//     setLandingId(lastAddedId);
//     const landingTimer = setTimeout(() => setLandingId(null), 800);
//     const clearTimer = setTimeout(() => clearLastAdded(), 820);
//     return () => {
//       clearTimeout(landingTimer);
//       clearTimeout(clearTimer);
//     };
//   }, [lastAddedId, clearLastAdded]);

//   // delete confirm handlers
//   function handleConfirmDelete() {
//     const id = confirmId!;
//     setConfirmId(null);
//     deleteField(id); // moves into undo buffer
//     setShowUndo(true); // show toast
//   }
//   function handleUndo() {
//     setShowUndo(false);
//     undoRemove();
//   }
//   function handleToastClose() {
//     setShowUndo(false);
//     clearLastRemoved();
//   }

//   return (
//     <main className="flex-1 bg-white text-gray-900">
//       <Header />
//       <div
//         ref={setNodeRef}
//         className={`p-4 min-h-[240px] transition-colors ${
//           isOver
//             ? "rounded-lg border-2 border-dashed border-blue-400 bg-blue-50/40"
//             : "rounded-lg border-2 border-dashed border-gray-200"
//         } ${mode === "preview" ? "pointer-events-none opacity-60" : ""}`}
//       >
//         {fields.length === 0 ? (
//           <div className="rounded-lg border border-dashed p-8 text-center text-sm text-gray-500">
//             Drag from the left to add your first field.
//           </div>
//         ) : (
//           <SortableContext items={fields.map((f) => f.id)}>
//             <ul className="space-y-4">
//               {fields.map((f, idx) => (
//                 <SortableFieldCard
//                   key={f.id}
//                   field={f}
//                   index={idx}
//                   landing={landingId === f.id}
//                   onEdit={(id) => setConfigId(id)}
//                   onRequestDelete={(id) => setConfirmId(id)}
//                 />
//               ))}
//             </ul>
//           </SortableContext>
//         )}
//       </div>

//       {mode === "preview" ? (
//         <PreviewOverlay onExit={() => setMode("builder")} />
//       ) : null}

//       {/* Quick config modal */}
//       <QuickConfigDialog
//         fieldId={configId}
//         open={!!configId}
//         onClose={() => setConfigId(null)}
//       />

//       {/* Delete confirm + Undo toast */}
//       <ConfirmDialog
//         open={!!confirmId}
//         onCancel={() => setConfirmId(null)}
//         onConfirm={handleConfirmDelete}
//       />
//       <UndoToast
//         show={showUndo && !!lastRemoved}
//         message={
//           lastRemoved ? `Deleted “${lastRemoved.field.label}”.` : "Deleted."
//         }
//         onUndo={handleUndo}
//         onClose={handleToastClose}
//       />
//     </main>
//   );
// }


"use client";

import { Header } from "@/components/header";
import { useFormStore } from "@/lib/store";
import { useDroppable } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { SortableContext } from "@dnd-kit/sortable";
import PreviewOverlay from "@/components/preview";
// import RenderField from "@/components/render-field";

// modularized pieces
import FieldCard from "@/components/builder/FieldCard";
import ConfigDialog from "@/components/builder/ConfigDialog";
import DeleteConfirm from "@/components/builder/DeleteConfirm";
import UndoToast from "@/components/builder/UndoToast";
import useConfirm from "@/hooks/useConfirm";

type CanvasProps = {
  forceOpenConfigForId?: string | null;
  onConfigHandled?: () => void;
};

export default function Canvas({ forceOpenConfigForId, onConfigHandled }: CanvasProps) {
  const fields = useFormStore((s) => s.fields);
  const lastAddedId = useFormStore((s) => s.lastAddedId);
  const clearLastAdded = useFormStore((s) => s.clearLastAdded);
  const deleteField = useFormStore((s) => s.deleteField);
  const lastRemoved = useFormStore((s) => s.lastRemoved);
  const undoRemove = useFormStore((s) => s.undoRemove);
  const clearLastRemoved = useFormStore((s) => s.clearLastRemoved);
  const mode = useFormStore((s) => s.mode);
  const setMode = useFormStore((s) => s.setMode);

  const { setNodeRef, isOver } = useDroppable({ id: "canvas" });

  const [landingId, setLandingId] = useState<string | null>(null);
  const [configId, setConfigId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const { confirm,Dialog } = useConfirm();

  // Open config dialog after explicit add (inserts or append)
  useEffect(() => {
    if (!forceOpenConfigForId) return;
    const t = setTimeout(() => {
      setConfigId(forceOpenConfigForId);
      onConfigHandled?.();
    }, 60);
    return () => clearTimeout(t);
  }, [forceOpenConfigForId, onConfigHandled]);

  // Landing pulse
  useEffect(() => {
    if (!lastAddedId) return;
    setLandingId(lastAddedId);
    const landingTimer = setTimeout(() => setLandingId(null), 800);
    const clearTimer = setTimeout(() => clearLastAdded(), 820);
    return () => {
      clearTimeout(landingTimer);
      clearTimeout(clearTimer);
    };
  }, [lastAddedId, clearLastAdded]);

  // Delete + undo
  function handleConfirmDelete() {
    const id = confirmId!;
    setConfirmId(null);
    deleteField(id);
    setShowUndo(true);
  }
  function handleUndo() {
    setShowUndo(false);
    undoRemove();
  }
  function handleToastClose() {
    setShowUndo(false);
    clearLastRemoved();
  }

  async function requestDelete(id: string, label: string) {
    const ok = await confirm({
      title: "Remove field?",
      description: `Are you sure you want to delete “${label}”?`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (ok) deleteField(id);
    requestAnimationFrame(() => setShowUndo(true));
  }

  return (
    <main className="flex-1 bg-white text-gray-900">
      <Header />
      <div
        ref={setNodeRef}
        className={`p-4 min-h-[240px] transition-colors ${
          isOver ? "rounded-lg border-2 border-dashed border-blue-400 bg-blue-50/40" : "rounded-lg border-2 border-dashed border-gray-200"
        } ${mode === "preview" ? "pointer-events-none opacity-60" : ""}`}
      >
        {fields.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-gray-500">
            Drag from the left to add your first field.
          </div>
        ) : (
          <SortableContext items={fields.map((f) => f.id)}>
            <ul className="space-y-4">
              {fields.map((f, idx) => (
                <FieldCard
                  key={f.id}
                  field={f}
                  index={idx}
                  landing={landingId === f.id}
                  onEdit={(id) => setConfigId(id)}
                  onRequestDelete={(id, label) => requestDelete(id, label)}
                />
              ))}
            </ul>

            {/* builder shows preview-looking inputs (disabled) */}
            <div className="sr-only">{/* for accessibility grouping */}</div>
          </SortableContext>
        )}
      </div>

      {/* Preview overlay */}
      {mode === "preview" ? <PreviewOverlay onExit={() => setMode("builder")} /> : null}

      {/* Config modal */}
      <ConfigDialog fieldId={configId} open={!!configId} onClose={() => setConfigId(null)} />

      {Dialog}

      {/* Delete confirm + Undo */}
      <DeleteConfirm open={!!confirmId} onCancel={() => setConfirmId(null)} onConfirm={handleConfirmDelete} />
      <UndoToast
        show={showUndo && !!lastRemoved}
        message={lastRemoved ? `Deleted “${lastRemoved.field.label}”.` : "Deleted."}
        onUndo={handleUndo}
        onClose={handleToastClose}
      />
    </main>
  );
}
