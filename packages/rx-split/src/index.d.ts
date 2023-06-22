export * from "./RxSplit";
import { RxSplit } from "./RxSplit";

declare global {
  interface HTMLElementTagNameMap {
    "rx-split": RxSplit;
  }
  namespace JSX {
    interface IntrinsicElements {
      "rx-split": RxSplit;
    }
  }
}
