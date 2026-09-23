import { Readable } from 'node:stream';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { handleSuggestion } from './jev.js';

// The same handler is used by Astro dev/preview and the Vercel /api function.
export function jevApi() {
  const configure = server => {
    if (existsSync('.env')) loadEnvFile('.env');
    server.middlewares.use('/api/suggest-service', async (req, res, next) => {
      if (req.url?.split('?')[0] !== '/' && req.url?.split('?')[0] !== '') return next();
      try {
        const request = new Request(`http://${req.headers.host}/api/suggest-service`, {
          method: req.method,
          headers: req.headers,
          ...(!['GET', 'HEAD'].includes(req.method) ? { body: Readable.toWeb(req), duplex: 'half' } : {}),
        });
        const response = await handleSuggestion(request);
        res.writeHead(response.status, Object.fromEntries(response.headers));
        res.end(Buffer.from(await response.arrayBuffer()));
      } catch {
        res.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        res.end('{"error":"unavailable"}');
      }
    });
  };
  return { name: 'multipro-jev-api', configureServer: configure, configurePreviewServer: configure };
}
