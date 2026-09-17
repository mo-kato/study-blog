// @ts-check

import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  site: "https://blog.naska.dev",
  markdown: {
    shikiConfig: {
      themes: {
        dark: "github-dark-default",
        light: "dark-plus",
      },
      // サイト既定はダーク。dark をインライン既定色にし、light は
      // --shiki-light 変数に載せて [data-color-mode=light] のとき差し替える。
      defaultColor: "dark",
    },
  },
});
