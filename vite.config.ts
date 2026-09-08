import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { createServer as createHttpServer } from 'http';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    {
      name: 'propradar-sync-api',
      configureServer(server) {
        server.middlewares.use('/api/sync-propradar', async (req, res) => {
          if (req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }
          try {
            const { syncPropRadar } = await import('./scripts/sync-propradar.js');
            const result = await syncPropRadar();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error('[sync-propradar]', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: message }));
          }
        });
      }
    }
  ],
});
