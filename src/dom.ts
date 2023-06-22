export type Rect = Pick<DOMRect, "height" | "width">;
export type RectXY = Rect & Pick<DOMRect, "x" | "y">;
export type RectPair = [Rect, Rect];
export interface Range {
  min: number;
  max: number;
}
export interface Track {
  idx: number;
  rects: [number, number];
  position: number;
}

export function parseNumAttr(el: HTMLElement, key: string): number | null {
  const attr = el.getAttribute(key);
  return typeof attr == "string" ? parseInt(attr) : attr;
}
