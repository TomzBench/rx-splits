import { Observable, merge, OperatorFunction } from "rxjs";
import { filter, connect, auditTime, take, skip } from "rxjs/operators";
import { Track, Range } from "./dom";

export type RX_MOUSE_EVENT_TYPES = "up" | "down" | "move";

export interface RxMouseEvent {
  type: RX_MOUSE_EVENT_TYPES;
}

export interface RxMouseUpEvent extends RxMouseEvent {
  type: "up";
}

export interface RxMouseDownEvent extends RxMouseEvent {
  type: "down";
  idx: number;
  range: Range;
}

export interface RxMouseMoveEvent extends RxMouseEvent {
  type: "move";
  x: number;
  y: number;
}

export type RxMouseEvents =
  | RxMouseUpEvent
  | RxMouseDownEvent
  | RxMouseMoveEvent;

export type RxMouseTracking = Omit<RxMouseDownEvent, "type"> &
  Omit<RxMouseMoveEvent, "type">;

export function isMouseUpEvent(obs: RxMouseEvents): obs is RxMouseUpEvent {
  return obs.type == "up";
}

export function isMouseDownEvent(obs: RxMouseEvents): obs is RxMouseDownEvent {
  return obs.type == "down";
}

export function isMouseMoveEvent(obs: RxMouseEvents): obs is RxMouseMoveEvent {
  return obs.type == "move";
}

export function throttler<T>(ms: number) {
  return function (source: Observable<T>) {
    return source.pipe(
      connect((obs$) =>
        merge(obs$.pipe(take(1)), obs$.pipe(skip(1), auditTime(ms)))
      )
    );
  };
}

export function oor<T extends { position: number }>(
  min: number,
  max: number
): OperatorFunction<T, T> {
  return function (source: Observable<T>) {
    return source.pipe(filter((e) => e.position >= min && e.position <= max));
  };
}

export function scanFn(acc: Track, curr: Track): Track {
  const diff = acc.position - curr.position;
  if (diff > 0 && diff > curr.rects[0]) {
    curr.rects[1] += curr.rects[0];
    curr.rects[0] = 0;
  } else if (diff < 0 && -diff > curr.rects[1]) {
    curr.rects[0] += curr.rects[1];
    curr.rects[1] = 0;
  } else {
    curr.rects[0] -= diff;
    curr.rects[1] += diff;
  }
  return curr;
}
