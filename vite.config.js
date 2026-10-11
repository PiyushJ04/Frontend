import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The dev-server proxy means the frontend and backend can be worked on
// at the same time without CORS friction - fetch("/api/...") from the
// browser gets forwarded to the FastAPI container automatically.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://backend:8000",
        changeOrigin: true
      }
    }
  }
});
