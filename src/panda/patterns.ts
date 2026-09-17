import { definePattern } from "@pandacss/dev";

export const flex = definePattern({
  transform(props) {
    const { direction, align, ...rest } = props;
    return {
      display: "flex",
      alignItems: align ?? "center",
      flexDir: direction ?? "row",
      ...rest,
    };
  },
});

export const layoutInner = definePattern({
  transform(props) {
    const { ...rest } = props;
    return {
      w: "mainInner",
      maxW: "4xl",
      mx: "auto",
      px: {
        base: 5,
        md: 0,
      },
      ...rest,
    };
  },
});

export const tagList = definePattern({
  transform(props) {
    const { direction, align, gap, flexWrap, ...rest } = props;
    return {
      display: "flex",
      alignItems: align ?? "center",
      flexDir: direction ?? "row",
      gap: gap ?? 2,
      flexWrap: flexWrap ?? "wrap",
      ...rest,
    };
  },
});
