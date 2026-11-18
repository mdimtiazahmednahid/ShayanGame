const ttsCache = new Map();

export default async function handler(req, res) {
  try {
    const text = (req.query.text || '').toString();
    const lang = (req.query.lang || 'bn').toString();

    if (!text.trim()) {
      res.status(400).send('Missing text');
      return;
    }

    const cacheKey = `${lang}:${text}`;
    if (ttsCache.has(cacheKey)) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.status(200).send(ttsCache.get(cacheKey));
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
      res.status(upstream.status).send('TTS upstream error');
      return;
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    ttsCache.set(cacheKey, buf);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(buf);
  } catch (err) {
    res.status(500).send(err instanceof Error ? err.message : 'TTS error');
  }
}
