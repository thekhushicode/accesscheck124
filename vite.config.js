import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { scanWebsiteUrl } from './src/server/scanner.js';

/**
 * Custom Vite Plugin to provide the server-side scanning API
 * directly inside the Vite development server on port 3000.
 */
function scannerApiPlugin() {
  return {
    name: 'scanner-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlObj = new URL(req.url, 'http://localhost:3000');
        
        if (urlObj.pathname === '/api/scan') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            return res.end();
          }

          let targetUrl = urlObj.searchParams.get('url');

          if (req.method === 'POST') {
            let body = '';
            for await (const chunk of req) {
              body += chunk;
            }
            try {
              const parsed = JSON.parse(body);
              if (parsed.url) targetUrl = parsed.url;
            } catch (e) {
              // Ignore JSON parse error, fallback to query param
            }
          }

          if (!targetUrl) {
            res.statusCode = 400;
            return res.end(JSON.stringify({
              success: false,
              error: 'Missing "url" parameter. Please provide a URL to scan.'
            }));
          }

          try {
            const results = await scanWebsiteUrl(targetUrl);
            res.statusCode = results.success ? 200 : 400;
            return res.end(JSON.stringify(results));
          } catch (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({
              success: false,
              error: `Internal scanner error: ${err.message}`
            }));
          }
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    scannerApiPlugin()
  ],
  server: {
    port: 3000,
    open: false
  }
});
