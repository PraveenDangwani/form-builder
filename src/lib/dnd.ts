export type DragKind = "PALETTE" | "FIELD";

export type PaletteDragData = {
  kind: "PALETTE";
  type: import("./types").FieldType;
};

export type FieldDragData = {
  kind: "FIELD";
  id: string;
  fromIndex: number;
};

export type DragData = PaletteDragData | FieldDragData;
