import { defineSlotRecipe } from "@pandacss/dev";

export const tagStyle = defineSlotRecipe({
  className: "tag-button",
  slots: ["root", "label"],
  base: {
    root: {
      display: "flex",
      flexDir: "row",
      alignItems: "center",
      gap: 1,
      rounded: "md",
      px: 2,
      py: 0.5,
      hairline: "border",
      lineHeight: "normal",
      textDecoration: "none!",
      whiteSpace: "nowrap",
      _hover: {
        borderColor: "border.hover",
      },
    },
    label: {
      _before: {
        content: '"#"',
        mt: 0.5,
        mr: 1,
        w: 3,
        color: "primary.600",
        _light: {
          color: "primary.400",
        },
      },
    },
  },
});
