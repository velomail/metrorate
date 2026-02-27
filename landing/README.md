# MetroRate landing page

Static landing page for Vercel.

## Vercel: set Root Directory

So Vercel deploys only this folder (and not the extension code):

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → your **metrorate** project.
2. Go to **Settings** (left sidebar).
3. Open **General**.
4. Scroll to **Build and development settings** (or **Build and Deployment**).
5. Find **Root Directory** — click **Edit** or **Override**.
6. Enter: **`landing`**
7. Click **Save**.

Redeploy if needed. Your site will be built from the `landing/` folder only.
