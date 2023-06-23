import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { RxSplit } from "./RxSplit";

const meta = {
  title: "RxSplit",
  component: RxSplit,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof RxSplit>;

export default meta;
type Story = StoryObj<typeof meta>;

interface BoxProps {
  color: string;
  width: number;
  height: number;
}
//const Box = ({ color, width, height }: BoxProps) => (<div style=`"height: ${height}px; width: ${width}px; background-color: ${color}"`></div>);
const Box = ({ color: backgroundColor, width, height }: BoxProps) => (
  <div
    style={{ backgroundColor, height: `${height}px`, width: `${width}px` }}
  ></div>
);

export const Primary: Story = {
  argTypes: {
    vertical: {
      control: { type: "boolean" },
      sampleTime: { control: { type: "number" } },
    },
  },
  render: ({ vertical, sampleTime }) => (
    <RxSplit sampleTime={sampleTime} vertical={vertical}>
      <Box color="red" height={200} width={200} />
      <Box color="blue" height={200} width={200} />
      <Box color="green" height={200} width={200} />
    </RxSplit>
  ),
};
