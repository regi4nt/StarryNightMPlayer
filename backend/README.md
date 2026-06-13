# StarryNight Backend — Panduan Deploy

Backend ini menjalankan `yt-dlp` + `FFmpeg` untuk mendownload dan mengkonversi
audio YouTube ke MP3. Karena Vercel tidak mendukung eksekusi binary seperti ini,
backend di-hosting terpisah di **Render.com** atau **Railway.app** (keduanya gratis).

---

## Cara Deploy ke Render.com (Gratis)

### 1. Push backend ke GitHub

Buat repository GitHub baru (mis. `starrynight-backend`), lalu push folder `backend/` ini:

```bash
cd backend
git init
git add .
git commit -m "initial backend"
git remote add origin https://github.com/USERNAME/starrynight-backend.git
git push -u origin main
```

### 2. Buat Web Service di Render

1. Buka [render.com](https://render.com) → **New → Web Service**
2. Hubungkan repository `starrynight-backend`
3. Isi konfigurasi:
   - **Runtime**: Node
   - **Build Command**: `npm install && pip install yt-dlp`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### 3. Set Environment Variables di Render

Di menu **Environment** → tambahkan:

| Key | Value | Keterangan |
|-----|-------|------------|
| `ALLOWED_ORIGIN` | `https://nama-app-kamu.vercel.app` | URL frontend Vercel kamu |
| `BACKEND_KEY` | `rahasia123` | (opsional) kunci akses, isi juga di Settings app |

> **Catatan**: Render Free tier akan sleep setelah 15 menit tidak ada request.
> Request pertama setelah tidur butuh ~30 detik untuk bangun. Ini normal.

### 4. Pastikan ffmpeg tersedia

Render.com (Debian/Ubuntu) sudah include `ffmpeg`. Jika belum, tambahkan di Build Command:

```
npm install && pip install yt-dlp && apt-get install -y ffmpeg
```

---

## Cara Deploy ke Railway.app (Gratis)

1. Buka [railway.app](https://railway.app) → **New Project → Deploy from GitHub**
2. Pilih repository backend kamu
3. Railway auto-detect Node.js → langsung deploy
4. Set environment variables yang sama seperti di atas
5. Tambahkan di `railway.toml` (opsional):

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
```

Tambahkan ffmpeg + yt-dlp via nixpacks dengan membuat file `nixpacks.toml`:

```toml
[phases.setup]
nixPkgs = ["ffmpeg"]

[phases.install]
cmds = ["npm install", "pip install yt-dlp"]
```

---

## Setelah Deploy

Salin URL backend kamu (mis. `https://starrynight-backend.onrender.com`), lalu:

1. Buka app StarryNight MPlayer
2. Masuk ke **Settings → YouTube**
3. Paste URL backend di field **"URL Backend Converter"**
4. Klik **Test** untuk memverifikasi koneksi

Setelah URL backend tersimpan, fitur download audio YouTube akan otomatis
menggunakan backend kamu (yt-dlp + ffmpeg) sebagai method pertama.

---

## Endpoint API

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/health` | GET | Cek status server + yt-dlp + ffmpeg |
| `/download?videoId=ID` | GET | Download audio YT sebagai MP3 |
| `/download?videoId=ID&format=opus` | GET | Download sebagai Opus (lebih kecil) |
| `/download?videoId=ID&format=m4a` | GET | Download sebagai M4A |
| `/info?videoId=ID` | GET | Ambil metadata video |

Jika `BACKEND_KEY` diset, tambahkan header `X-Backend-Key: kunci_kamu` di setiap request,
atau tambahkan `?key=kunci_kamu` di query string.
