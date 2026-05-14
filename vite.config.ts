import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

import Tailwindcss from "@tailwindcss/vite";
import Vue from "@vitejs/plugin-vue";
import WebfontDownload from "vite-plugin-webfont-dl";

// https://vite.dev/config/
export default defineConfig({
  plugins: [Vue(), Tailwindcss(), WebfontDownload()],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
