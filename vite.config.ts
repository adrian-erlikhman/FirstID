import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Static site: no server, nothing a person types ever leaves their phone.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
