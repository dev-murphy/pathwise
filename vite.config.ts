import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { DevTools } from "@vitejs/devtools";
import Tailwindcss from "@tailwindcss/vite";
import Vue from "@vitejs/plugin-vue";
import VueRouter from "vue-router/vite";
import { VueRouterAutoImports } from "vue-router/dist/unplugin/index.cjs";
import WebfontDownload from "vite-plugin-webfont-dl";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    AutoImport({
      imports: ["vue", "@vueuse/core", VueRouterAutoImports],
      dts: "src/types/auto-imports.d.ts",
    }),
    Components({
      extensions: ["vue"],
      dts: "src/types/components.d.ts",
    }),
    VueRouter({
      dts: "src/types/typed-router.d.ts",
    }),
    Vue(),
    Tailwindcss(),
    WebfontDownload(),
    DevTools(),
  ],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
