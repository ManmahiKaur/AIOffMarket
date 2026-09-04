import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
  const supabaseUrl = env.VITE_SUPABASE_URL;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api/supabase': {
          target: supabaseUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/supabase/, ''),
          configure: (proxy) => {
            const activeKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || '';
            console.log('[PROXY INIT] Key loaded:', activeKey ? activeKey.substring(0, 10) + '...' : 'MISSING');
            proxy.on('proxyReq', (proxyReq, req) => {
              const keyToUse = env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || '';
              proxyReq.setHeader('apikey', keyToUse);
              proxyReq.setHeader('Authorization', `Bearer ${keyToUse}`);
              proxyReq.removeHeader('origin');
              proxyReq.removeHeader('referer');
              proxyReq.removeHeader('sec-fetch-dest');
              proxyReq.removeHeader('sec-fetch-mode');
              proxyReq.removeHeader('sec-fetch-site');
              proxyReq.removeHeader('sec-fetch-user');
              proxyReq.setHeader('user-agent', 'node-fetch');
              console.log('[PROXY REQ]', req.url, '| apikey set:', !!keyToUse);
            });
            proxy.on('proxyRes', (proxyRes, req) => {
              console.log('[PROXY RES]', req.url, '| status:', proxyRes.statusCode);
            });
          },
        }
      }
    }
  };
});
