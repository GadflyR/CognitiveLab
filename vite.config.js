import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // ① any import that starts with "@/…" now maps to /src/…
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
