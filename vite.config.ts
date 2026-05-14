import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { DevTools } from "@vitejs/devtools";
import Tailwindcss from "@tailwindcss/vite";
import Vue from "@vitejs/plugin-vue";
import WebfontDownload from "vite-plugin-webfont-dl";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    AutoImport({
      imports: ["vue", "@vueuse/core"],
      dts: "src/types/auto-imports.d.ts",
    }),
    Components({
      extensions: ["vue"],
      dts: "src/types/components.d.ts",
    }),
    DevTools(),
    Vue(),
    Tailwindcss(),
    WebfontDownload(),
  ],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
