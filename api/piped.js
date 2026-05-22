/**
 * Vercel Serverless Function: /api/piped
 *
 * Thin wrapper — forwards all requests to /api/invidious with backend=piped.
 * This lets the frontend use '/api/piped' as a CORS-free Piped proxy without
 * duplicating the retry/fallback logic that lives in invidious.js.
 */

import handler from './invidious.js';

export const config = { runtime: 'nodejs' };

export default function pipedHandler(req, res) {
  // Inject backend=piped so invidious.js routes to the Piped instances
  req.query = { ...req.query, backend: 'piped' };
  return handler(req, res);
}
