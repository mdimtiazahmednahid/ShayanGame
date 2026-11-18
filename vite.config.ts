import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const ttsCache = new Map<string, Buffer>();

function banglaTtsProxy(): Plugin {
  return {
    name: 'bangla-tts-proxy',
    configureServer(server) {
      server.middlewares.use('/api/tts', async (req, res) => {
        try {
          const url = new URL(req.url || '', 'http://localhost');
          const text = url.searchParams.get('text') || '';
          const lang = url.searchParams.get('lang') || 'bn';

          if (!text.trim()) {
            res.statusCode = 400;
            res.end('Missing text');
            return;
          }

          const cacheKey = `${lang}:${text}`;
          const cached = ttsCache.get(cacheKey);
          if (cached) {
            res.setHeader('Content-Type', 'audio/mpeg');
            res.end(cached);
            return;
          }

          const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
            lang
          )}&client=tw-ob&q=${encodeURIComponent(text)}`;

          const upstream = await fetch(ttsUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
          });

          if (!upstream.ok) {
            res.statusCode = upstream.status;
            res.end('TTS upstream error');
            return;
          }

          const buf = Buffer.from(await upstream.arrayBuffer());
          ttsCache.set(cacheKey, buf);
          res.setHeader('Content-Type', 'audio/mpeg');
          res.end(buf);
        } catch (err) {
          res.statusCode = 500;
          res.end(err instanceof Error ? err.message : 'TTS proxy error');
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), banglaTtsProxy()],
});
