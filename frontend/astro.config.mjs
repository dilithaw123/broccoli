// @ts-check
import { defineConfig } from "astro/config";

import solidJs from "@astrojs/solid-js";

import tailwindcss from "@tailwindcss/vite";

import auth from "auth-astro";

// https://astro.build/config
export default defineConfig({
  integrations: [solidJs(), auth()],

  vite: {
    plugins: [tailwindcss()],
  },
});