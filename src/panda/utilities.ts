import { defineUtility } from "@pandacss/dev";

export default {
  // 1. 全方向 (border)
  hairline: defineUtility({
    property: "border",
    values: "colors",
    transform: (value) => ({ border: `1px solid ${value}` }),
  }),
  // 2. 上 (borderTop)
  hairlineTop: defineUtility({
    property: "borderTop",
    values: "colors",
    transform: (value) => ({ borderTop: `1px solid ${value}` }),
  }),
  // 3. 下 (borderBottom)
  hairlineBottom: defineUtility({
    property: "borderBottom",
    values: "colors",
    transform: (value) => ({ borderBottom: `1px solid ${value}` }),
  }),
  // 4. 左 (borderLeft)
  hairlineLeft: defineUtility({
    property: "borderLeft",
    values: "colors",
    transform: (value) => ({ borderLeft: `1px solid ${value}` }),
  }),
  // 5. 右 (borderRight)
  hairlineRight: defineUtility({
    property: "borderRight",
    values: "colors",
    transform: (value) => ({ borderRight: `1px solid ${value}` }),
  }),
  // 6. 左右 (borderX)
  hairlineX: defineUtility({
    property: "borderBlock",
    values: "colors",
    transform: (value) => ({ borderX: `1px solid ${value}` }),
  }),
  // 7. 上下 (borderY)
  hairlineY: defineUtility({
    property: "borderInline",
    values: "colors",
    transform: (value) => ({ borderY: `1px solid ${value}` }),
  }),
};
