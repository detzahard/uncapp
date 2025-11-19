import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      sass: {
        silenceDeprecations: ["import", "global-builtin", "color-functions"],
      },
    },
  },
});
