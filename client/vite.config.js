import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // fail loudly instead of quietly using 5174

    // ------------------------------------------------------------
    // THE DEV PROXY  —  you switch this ON during Day 2.
    //
    // It is commented out on purpose. Uncomment it in Lab 2 and
    // RESTART Vite (config changes do not hot-reload).
    //
    // Why it removes the CORS problem: your React code asks for
    // "/api/albums" with no host. The browser fills in the current
    // page's address, making it localhost:5173/api/albums — the SAME
    // origin. No CORS rules apply. Vite then forwards it to
    // localhost:5000 itself, and Vite is a Node program, not a
    // browser, so CORS does not apply to it either.
    //
    // NOTE: this only exists while developing. There is no Vite dev
    // server in production, which is why you ALSO need CORS on the
    // backend. Day 5 makes this very clear.
    // ------------------------------------------------------------

    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
