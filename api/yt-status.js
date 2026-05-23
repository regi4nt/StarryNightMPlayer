/**
 * GET /api/yt-status
 *
 * Memberitahu frontend apakah server memiliki YOUTUBE_API_KEY dikonfigurasi.
 * Tidak pernah mengekspos key-nya sendiri — hanya boolean hasKey.
 *
 * Frontend menggunakan ini agar bisa memakai /api/youtube?action=search
 * sebagai proxy meskipun user tidak memasukkan key sendiri di Settings.
 */
export const config = { runtime: 'nodejs' };

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  const hasKey = !!process.env.YOUTUBE_API_KEY;
  return res.status(200).json({ hasKey });
}
