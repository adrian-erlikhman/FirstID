import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Static site: no server, nothing a person types ever leaves their phone.
// ONE_FILE=1 builds the single-page versions (the shareable preview and the
// HTML file we email), which carry their fonts inside the stylesheet.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { assetsInlineLimit: process.env.ONE_FILE ? 100_000_000 : 4096 },
});
