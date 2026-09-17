import { defineConfig } from "@pandacss/dev";
import globalCss from "./src/panda/global";
import { flex, layoutInner, tagList } from "./src/panda/patterns";
import semanticTokens from "./src/panda/semantic-tokens";
import { tagStyle } from "./src/panda/slot-recipes";
import textStyles from "./src/panda/textStyles";
import tokens from "./src/panda/tokens";
import utilities from "./src/panda/utilities";

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: [
    "./src/**/*.{ts,tsx,js,jsx,astro,svelte}",
    "./pages/**/*.{ts,tsx,js,jsx,astro,svelte}",
  ],

  // Files to exclude
  exclude: [],

  // global
  globalCss,

  // Useful for theme customization
  theme: {
    extend: {
      breakpoints: {
        md: "600px",
      },
      tokens,
      semanticTokens,
      textStyles,
      slotRecipes: {
        tagStyle,
      },
    },
  },

  patterns: {
    layoutInner,
    tagList,
    extend: {
      flex,
    },
  },

  conditions: {
    light: "[data-color-mode=light] &",
  },

  utilities: {
    extend: utilities,
  },

  // The output directory for your css system
  outdir: "styled-system",
});
