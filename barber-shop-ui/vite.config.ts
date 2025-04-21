import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  mode: "development",
  plugins: [react()],
  server: {
    host: true,
  }
});
