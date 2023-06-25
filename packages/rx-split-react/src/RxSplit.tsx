import React from "react";
import { EventName, createComponent } from "@lit-labs/react";
import { RxSplit as RxSplitLit } from "rx-split";

export const RxSplit = createComponent({
  tagName: "rx-split",
  elementClass: RxSplitLit,
  react: React,
  events: {
    "onrx-resize": "rx-resize" as EventName<CustomEvent<[number, number]>>,
  },
});
