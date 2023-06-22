import React from "react";
import { createComponent } from "@lit-labs/react";
import { RxSplit as RxSplitLit } from "rx-split";

export const RxSplit = createComponent({
  tagName: "rx-split",
  elementClass: RxSplitLit,
  react: React,
  events: {
    //onactivate: "activate",
    //onchange: "change",
  },
});
