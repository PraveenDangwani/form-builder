"use client";

import { useFormStore } from "@/lib/store";
// import type { Field } from "@/lib/types";
import { useMemo } from "react";
import RenderField from "@/components/render-field";

// const inputBase =
//   "block w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

// function RenderField({ field }: { field: Field }) {
//   const label = (
//     <label className="mb-1 block text-sm font-medium text-gray-800" htmlFor={field.id}>
//       {field.label} {field.required ? <span className="text-red-600">*</span> : null}
//     </label>
//   );

//   switch (field.type) {
//     case "textarea":
//       return (
//         <div className="space-y-1">
//           {label}
//           <textarea
//             id={field.id}
//             className={inputBase}
//             placeholder={field.placeholder || ""}
//             rows={3}
//           />
//         </div>
//       );

//     case "select":
//     return (
//         <div className="space-y-1">
//         {label}
//         <select id={field.id} className={inputBase} defaultValue="">
//             {(field.options || []).map((o) => (
//             <option key={o.id} value={o.value}>
//                 {o.label}
//             </option>
//             ))}
//         </select>
//         </div>
//     )

//     case "radio":
//       return (
//         <fieldset className="space-y-2">
//           <legend className="mb-1 block text-sm font-medium text-gray-800">
//             {field.label} {field.required ? <span className="text-red-600">*</span> : null}
//           </legend>
//           <div className="space-y-2">
//             {(field.options || []).map((o) => (
//               <label key={o.id} className="flex items-center gap-2 text-sm text-gray-800">
//                 <input
//                   type="radio"
//                   name={field.id}
//                   value={o.value}
//                   className="h-4 w-4"
//                 />
//                 <span>{o.label}</span>
//               </label>
//             ))}
//           </div>
//         </fieldset>
//       );

//     case "checkbox":
//       // single checkbox field
//       return (
//         <label className="flex items-center gap-2 text-sm text-gray-800">
//           <input type="checkbox" id={field.id} className="h-4 w-4 rounded border-gray-300" />
//           <span>
//             {field.label} {field.required ? <span className="text-red-600">*</span> : null}
//           </span>
//         </label>
//       );

//     case "number":
//       return (
//         <div className="space-y-1">
//           {label}
//           <input
//             id={field.id}
//             type="number"
//             className={inputBase}
//             placeholder={field.placeholder || "0"}
//             inputMode="numeric"
//           />
//         </div>
//       );

//     case "email":
//       return (
//         <div className="space-y-1">
//           {label}
//           <input
//             id={field.id}
//             type="email"
//             className={inputBase}
//             placeholder={field.placeholder || "name@example.com"}
//             inputMode="email"
//           />
//         </div>
//       );

//     case "text":
//     default:
//       return (
//         <div className="space-y-1">
//           {label}
//           <input
//             id={field.id}
//             type="text"
//             className={inputBase}
//             placeholder={field.placeholder || "Type here…"}
//           />
//         </div>
//       );
//   }
// }

// export default function PreviewOverlay({
//   onExit,
// }: {
//   onExit: () => void;
// }) {
//   const fields = useFormStore((s) => s.fields);

//   const hasFields = useMemo(() => fields.length > 0, [fields.length]);

//   return (
//     <div className="pointer-events-auto fixed inset-0 z-[60] flex items-start justify-center bg-black/40">
//       <div className="mt-10 w-[min(720px,95vw)] rounded-xl bg-white shadow-xl ring-1 ring-black/5">
//         <div className="flex items-center justify-between border-b px-4 py-3">
//           <h2 className="text-base font-semibold text-gray-900">Form Preview</h2>
//           <button
//             type="button"
//             className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
//             onClick={onExit}
//           >
//             Back to Builder
//           </button>
//         </div>

//         <div className="px-5 py-5">
//           {!hasFields ? (
//             <div className="rounded-lg border border-dashed p-8 text-center text-sm text-gray-500">
//               No fields yet. Switch to Builder to add some.
//             </div>
//           ) : (
//             <form className="space-y-4">
//               {fields.map((f) => (
//                 <div key={f.id}>
//                   <RenderField field={f} />
//                 </div>
//               ))}

//               {/* You can wire submit later; keeping it inert for preview */}
//               <div className="pt-2">
//                 <button
//                   type="button"
//                   className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
//                   onClick={() => {}}
//                 >
//                   Submit (disabled in preview)
//                 </button>
//               </div>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



export default function PreviewOverlay({ onExit }: { onExit: () => void }) {
  const fields = useFormStore((s) => s.fields);
  const hasFields = useMemo(() => fields.length > 0, [fields.length]);

  return (
    <div className="pointer-events-auto fixed inset-0 z-[60] flex items-start justify-center bg-black/40">
      <div className="mt-10 w-[min(720px,95vw)] rounded-xl bg-white shadow-xl ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-base font-semibold text-gray-900">Form Preview</h2>
          <button
            type="button"
            className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
            onClick={onExit}
          >
            Back to Builder
          </button>
        </div>

        <div className="px-5 py-5">
          {!hasFields ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-gray-500">
              No fields yet. Switch to Builder to add some.
            </div>
          ) : (
            <form className="space-y-4">
              {fields.map((f) => (
                <div key={f.id} className="space-y-1">
                  {/* Show a label above the control (checkbox already includes its own inline label) */}
                  {f.type !== "checkbox" && (
                    <label className="block text-sm font-medium text-gray-900">
                      {f.label} {f.required ? <span className="text-red-600">*</span> : null}
                    </label>
                  )}

                  <RenderField field={f} />
                </div>
              ))}

              <div className="pt-2">
                <button
                  type="button"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Submit (disabled in preview)
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
