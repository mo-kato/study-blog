import { defineSemanticTokens } from "@pandacss/dev";

export default defineSemanticTokens({
  sizes: {
    mainInner: {
      value: {
        base: "100vw",
        md: "85vw",
      },
    },
  },
  colors: {
    text: {
      DEFAULT: {
        value: {
          base: "{colors.primary.200}",
          _light: "{colors.primary.800}",
        },
      },
    },
    background: {
      canvas: {
        value: {
          base: "{colors.primary.900}",
          _light: "{colors.primary.50}",
        },
      },
      header: {
        value: {
          base: "{colors.primary.950}",
          _light: "{colors.primary.50}",
        },
      },
    },
    border: {
      DEFAULT: {
        value: {
          base: "{colors.primary.800}",
          _light: "{colors.primary.200}",
        },
      },
      hover: {
        value: {
          base: "{colors.primary.700}",
          _light: "{colors.primary.300}",
        },
      },
    },
  },
});
