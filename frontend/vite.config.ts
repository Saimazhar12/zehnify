import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = (env.VITE_BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  let cookieDomain = 'localhost';
  try {
    cookieDomain = new URL(backendUrl).hostname;
  } catch {
    /* keep localhost */
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: cookieDomain,
          cookiePathRewrite: '/',
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
