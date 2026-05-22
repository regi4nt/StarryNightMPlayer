/**
 * Vercel Serverless Function: /api/youtube
 *
 * Proxy untuk YouTube Data API v3 — menyembunyikan API key di server,
 * tidak pernah ter-expose ke browser/client.
 *
 * Endpoints yang didukung:
 *   GET /api/youtube?action=search&q=lofi+hip+hop&maxResults=10&type=video
 *   GET /api/youtube?action=trending&regionCode=ID&maxResults=8&videoCategoryId=10
 *   GET /api/youtube?action=videos&id=dQw4w9WgXcQ,abc123  (detail video)
 *
 * Response selalu dalam format yang sama dengan YouTube Data API v3 (items array).
 */

const YT_BASE = 'https://www.googleapis.com/youtube/v3';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'YouTube API key not configured' });
  }

  const { action, ...clientParams } = req.query;

  try {
    let endpoint, params;

    if (action === 'search') {
      // Search videos
      endpoint = `${YT_BASE}/search`;
      params = new URLSearchParams({
        key: apiKey,
        part: 'snippet',
        type: clientParams.type || 'video',
        videoCategoryId: '10', // Music
        maxResults: clientParams.maxResults || '10',
        q: clientParams.q || '',
        safeSearch: 'none',
        relevanceLanguage: clientParams.lang || 'id',
        regionCode: clientParams.regionCode || 'ID',
        fields: 'items(id/videoId,snippet/title,snippet/channelTitle,snippet/thumbnails/medium)',
      });

    } else if (action === 'trending') {
      // Trending music videos
      endpoint = `${YT_BASE}/videos`;
      params = new URLSearchParams({
        key: apiKey,
        part: 'snippet,contentDetails',
        chart: 'mostPopular',
        videoCategoryId: clientParams.videoCategoryId || '10', // 10 = Music
        regionCode: clientParams.regionCode || 'ID',
        maxResults: clientParams.maxResults || '8',
        fields: 'items(id,snippet/title,snippet/channelTitle,snippet/thumbnails/medium,contentDetails/duration)',
      });

    } else if (action === 'videos') {
      // Video details (for duration etc)
      endpoint = `${YT_BASE}/videos`;
      params = new URLSearchParams({
        key: apiKey,
        part: 'snippet,contentDetails',
        id: clientParams.id || '',
        fields: 'items(id,snippet/title,snippet/channelTitle,snippet/thumbnails/medium,contentDetails/duration)',
      });

    } else {
      return res.status(400).json({ error: `Unknown action: ${action}. Use search, trending, or videos.` });
    }

    const response = await fetch(`${endpoint}?${params}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: 'YouTube API error',
        status: response.status,
        detail: err?.error?.message || response.statusText,
      });
    }

    const data = await response.json();

    // Cache successful responses (search: 2min, trending: 10min)
    const maxAge = action === 'trending' ? 600 : 120;
    res.setHeader('Cache-Control', `s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`);

    return res.status(200).json(data);

  } catch (e) {
    return res.status(500).json({ error: 'Proxy error', detail: e.message });
  }
}
