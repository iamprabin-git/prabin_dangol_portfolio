# Prabin Dangol — Web Developer Portfolio

Personal Next.js portfolio with a private admin studio so you can upload, edit, and delete projects without a rebuild. Deploys on Vercel’s free Hobby plan.

## What you get

- Public site: home, project archive, project pages, contact
- Admin at `/admin`: password-protected project uploads (image, write-up, tags, live/GitHub links)
- Local storage while you develop (`data/projects.json` + `public/uploads`)
- Vercel Blob on production so uploads survive serverless deploys

Edit your name, bio, email, and social links in [`lib/site.ts`](lib/site.ts).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

- Password in development: `admin` (or whatever you set in `.env.local`)
- Copy `.env.example` to `.env.local` to change it

## Deploy to Vercel (free)

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo, and deploy. Next.js is detected automatically.
3. In the project: **Settings → Environment Variables**
   - `ADMIN_PASSWORD` — the password you will use at `/admin`
   - `AUTH_SECRET` — any long random string
4. Enable persistent uploads:
   - Open **Storage → Create Database → Blob**
   - Create a **public** Blob store and connect it to this project (Production + Preview + Development)
   - Vercel adds `BLOB_READ_WRITE_TOKEN` (and OIDC vars) for you
5. Redeploy so the new variables are picked up.

Until Blob is connected, the live site still shows the seed projects, but new uploads cannot be saved (Vercel’s filesystem is read-only).

## Daily use

1. Visit `https://your-domain.vercel.app/admin`
2. Sign in with `ADMIN_PASSWORD`
3. **Upload project**, add a cover image (JPG/PNG/WebP/GIF/SVG, max 4MB), and publish
4. Featured projects appear on the home page; all projects appear at `/projects`

## Notes

- Cover images on the Hobby plan must stay under 4MB (serverless request limit).
- Change placeholder GitHub/LinkedIn/email values in `lib/site.ts` before sharing the site.
- Seed work lives in `data/projects.json`. After the first successful admin save on Vercel, Blob becomes the source of truth.
