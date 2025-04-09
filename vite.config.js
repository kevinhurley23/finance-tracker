import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: "./",
  server: {
    proxy: {
      "/php": {
        target: "http://localhost/finance-tracker",
        changeOrigin: true,
      },
    },
  },
});
