// Split.stories.ts

import type { Meta, StoryObj } from "@storybook/web-components";
import { styleMap } from "lit/directives/style-map.js";
import { html } from "lit";
import "./RxSplit";

const meta: Meta = {
  component: "rx-split",
};
export default meta;

type Story = StoryObj;

// We make some boxes to render our dividers with
interface BoxProps {
  color: string;
  height: number;
  width: number;
}
const Box = ({ color: backgroundColor, height, width }: BoxProps) =>
  html`<div
    style=${styleMap({
      backgroundColor,
      height: `${height}px`,
      width: `${width}px`,
    })}
  ></div>`;

export const Primary: Story = {
  argTypes: {
    vertical: { control: { type: "boolean" } },
    sampleTime: { control: { type: "number" } },
  },
  render: ({ vertical, sampleTime }) => {
    const red = Box({ color: "red", height: 200, width: 200 });
    const blue = Box({ color: "blue", height: 200, width: 200 });
    const green = Box({ color: "green", height: 200, width: 200 });
    return html`<rx-split sample-time=${sampleTime} .vertical=${vertical}
      >${red}${blue}${green}</rx-split
    > `;
  },
};
