import { Subject, merge } from "rxjs";
import {
  scan,
  map,
  sampleTime,
  takeUntil,
  switchMap,
  filter,
} from "rxjs/operators";

import { LitElement, css, html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { styleMap, StyleInfo } from "lit/directives/style-map.js";
import {
  customElement,
  queryAssignedElements,
  state,
  property,
} from "lit/decorators.js";

import { Track, parseNumAttr } from "./dom";
import {
  scanFn,
  oor,
  RxMouseEvents,
  isMouseUpEvent,
  isMouseDownEvent,
  isMouseMoveEvent,
} from "./mouse";

/**
 * pixlefy
 *
 * Take any number and assume it is a pixel length
 */
function pixlefy(props: StyleInfo): StyleInfo {
  function reducer(info: StyleInfo, key: keyof StyleInfo): StyleInfo {
    info[key] = typeof props[key] == "number" ? `${props[key]}px` : props[key];
    return info;
  }
  return (Object.keys(props) as (keyof StyleInfo)[])
    .filter((key) => props.hasOwnProperty(key))
    .reduce(reducer, {});
}

/**
 * grabBarReducer()
 */
function grabBarReducerVertical(offY: number) {
  return (grabBars: StyleInfo[], el: Element): StyleInfo[] => {
    const { y, width, height } = el.getBoundingClientRect();
    const top = y + height - 4 - offY;
    grabBars.push({ height: 8, width, left: 0, top });
    return grabBars;
  };
}

function grabBarReducerHorizontal(offX: number) {
  return (grabBars: StyleInfo[], el: Element): StyleInfo[] => {
    const { x, width, height } = el.getBoundingClientRect();
    const left = x + width - 4 - offX;
    grabBars.push({ width: 8, height, top: 0, left });
    return grabBars;
  };
}

/**
 */
@customElement("rx-split")
export class Split extends LitElement {
  @property({ type: Boolean, reflect: true })
  vertical: boolean = false;

  @property({ type: Number, reflect: true })
  x: number = 0;

  @property({ type: Number, reflect: true })
  y: number = 0;

  @property({ type: Number, reflect: true })
  height: number = 0;

  @property({ type: Number, reflect: true })
  width: number = 0;

  @queryAssignedElements()
  views!: Array<HTMLElement>;

  @state()
  protected _grabBars: undefined | StyleInfo[] = [];

  _mouse$: Subject<RxMouseEvents> = new Subject();
  _stop$: Subject<void> = new Subject();

  /**
   * hanhdleMouseLeave
   *
   * Convert DOM mouseleave events into an rx observable
   */
  private handleMouseLeave() {}

  /**
   * handleMouseDown
   *
   * Convert DOM mousedown events into an rx observable.
   */
  private handleMouseDown(e: MouseEvent & { target: HTMLDivElement }) {
    const idx = parseNumAttr(e.target, "idx");
    let center: number;
    let dimention: (rect: DOMRect) => number;
    if (this.vertical) {
      center = e.target.getBoundingClientRect().y - this.y + 4;
      dimention = (rect) => rect.height;
    } else {
      center = e.target.getBoundingClientRect().x - this.x + 4;
      dimention = (rect) => rect.width;
    }
    if (typeof idx == "number" && idx >= 0 && idx < this.views.length - 1) {
      const [a, b] = this.views
        .slice(idx, idx + 2)
        .map((view) => view.getBoundingClientRect())
        .map(dimention);
      this._mouse$.next({
        type: "down",
        idx,
        range: { min: center - a, max: center + b },
      });
    }
  }

  /**
   * handleMouseUp
   *
   * Convert DOM mouseup events into an rx observable.
   *
   * Generally, the mouseup event means we should stop moving the grab bar.
   */
  private handleMouseUp(_e: MouseEvent & { target: HTMLDivElement }) {
    this._mouse$.next({ type: "up" });
  }

  /**
   * handleMouseMove
   *
   * Convert DOM mousemove events into an rxobservable
   */
  private handleMouseMove(e: MouseEvent & { target: HTMLDivElement }) {
    const { x, y } = e;
    this._mouse$.next({ type: "move", x: x - this.x, y: y - this.y });
  }

  /**
   */
  private handleSlotChange() {
    this.updateRect();
    this.updateGrabBars();
  }

  /**
   */
  private updateRect() {
    const { height, width, x, y } = this.getBoundingClientRect();
    this.height = height;
    this.width = width;
    this.x = x;
    this.y = y;
  }

  /**
   */
  private updateGrabBars() {
    const { x, y, vertical: vertical } = this;
    const reducer = vertical
      ? grabBarReducerVertical(y)
      : grabBarReducerHorizontal(x);
    this._grabBars = this.views.reduce(reducer, []);
  }

  /**
   */
  private listen() {
    const stop$ = this._stop$.asObservable();
    const up$ = this._mouse$.asObservable().pipe(filter(isMouseUpEvent));
    const down$ = this._mouse$.asObservable().pipe(filter(isMouseDownEvent));
    const move$ = this._mouse$
      .asObservable()
      .pipe(filter(isMouseMoveEvent), sampleTime(8));
    let selectorFn: (idx: number) => [number, number];
    let resizeFn: (args: Track) => void;
    if (this.vertical) {
      selectorFn = (idx) => [
        this.views[idx].getBoundingClientRect().height,
        this.views[idx + 1].getBoundingClientRect().height,
      ];
      resizeFn = ({ idx, rects }) => {
        this.views[idx].style.height = `${rects[0]}px`;
        this.views[idx + 1].style.height = `${rects[1]}px`;
        this.updateGrabBars();
      };
    } else {
      selectorFn = (idx) => [
        this.views[idx].getBoundingClientRect().width,
        this.views[idx + 1].getBoundingClientRect().width,
      ];
      resizeFn = ({ idx, rects }) => {
        this.views[idx].style.width = `${rects[0]}px`;
        this.views[idx + 1].style.width = `${rects[1]}px`;
        this.updateGrabBars();
      };
    }
    down$
      .pipe(
        takeUntil(stop$),
        switchMap(({ idx, range }) =>
          move$.pipe(
            takeUntil(merge(stop$, up$)),
            map(({ x, y }) => ({
              idx,
              position: this.vertical ? y : x,
              rects: selectorFn(idx),
            })),
            oor(range.min, range.max),
            scan(scanFn)
          )
        )
      )
      .subscribe({
        next: (args) => resizeFn(args),
        complete: () => {},
      });
  }

  connectedCallback() {
    super.connectedCallback();
    this.listen();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stop$.next();
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has("vertical")) {
      this.handleSlotChange();
      this._stop$.next();
      this.listen();
    }
  }

  render() {
    return html`<div
      @mouseup=${this.handleMouseUp}
      @mousemove=${this.handleMouseMove}
      @mouseleave=${this.handleMouseLeave}
      class=${classMap({ horizontal: !this.vertical })}
    >
      ${this._grabBars &&
      this._grabBars.map(
        (grabBar, idx) => html`<div
          @mousedown=${this.handleMouseDown}
          idx=${idx}
          class="grabBar"
          style=${styleMap(pixlefy(grabBar))}
        ></div>`
      )}
      <slot @slotchange=${this.handleSlotChange}></slot>
    </div>`;
  }

  static styles = css`
    :host {
      display: inline-flex;
      position: relative;
    }
    .horizontal {
      display: inline-flex;
    }
    .grabBar {
      position: absolute;
      cursor: grab;
    }
  `;
}
