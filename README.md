# FIDA Admin Studio — Separate Site

This folder is a **standalone website** for managing FIDA products. Deploy it as its own Vercel project, separate from the public storefront. It uses the existing storefront's server-side API and the same PostgreSQL database; the database password is never included in this browser app.

## How the separate setup works

- **Public storefront project:** keeps `/api/products`, `/api/admin/login`, `/api/product-image`, and the PostgreSQL connection.
- **Admin Studio project (this folder):** an independent frontend deployed at a separate URL, such as `https://admin-your-site.vercel.app`.
- **PostgreSQL:** one shared database. Admin creates/edits/publishes products there; the storefront's `/api/products` endpoint reads published products from the same table.

## 1. Configure the existing storefront/backend project

In the existing FIDA storefront Vercel project, keep the `api/`, `server/`, and `db/` folders from the updated storefront bundle. Configure these server-only environment variables:

- `DATABASE_URL` — your PostgreSQL connection string
- `ADMIN_USERNAME` — admin username
- `ADMIN_PASSWORD` — long, unique admin password
- `ADMIN_SESSION_SECRET` — random secret of at least 32 characters
- `ADMIN_ORIGIN` — exact origin of this separate admin app, for example `https://admin-your-site.vercel.app`. Multiple origins may be comma-separated. For local admin development include `http://localhost:5174` too.
- Optional `PUBLIC_API_BASE_URL` on the backend: stable production backend origin used in uploaded image URLs. When omitted it uses the current request origin.

For the existing database, run `db/migrations/001-product-images.sql` from the updated backend archive in Neon SQL Editor. This only adds two nullable image storage columns and leaves existing products intact. Use `db/schema.sql` only when setting up a new database. Redeploy the storefront after updating environment variables and CORS-enabled API code.

## 2. Configure this admin site

Copy `.env.example` to `.env.local` and replace both origins with the deployed public storefront URL:

```env
VITE_API_BASE_URL=https://your-storefront-domain.example
VITE_STOREFRONT_URL=https://your-storefront-domain.example
```

These are public frontend origins, **not secrets**. Do not add `DATABASE_URL`, `ADMIN_PASSWORD`, or `ADMIN_SESSION_SECRET` to this admin project's `VITE_` variables.

## 3. Run locally

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:5174`. The backend must be deployed/configured and allow `http://localhost:5174` in `ADMIN_ORIGIN`, or run the storefront API locally with its own private environment. If using Vercel's hosted API for local testing, set `VITE_API_BASE_URL` to that hosted storefront's origin.

## 4. Deploy separately to Vercel

Update your **existing admin Vercel project** with this folder. The project root must contain `package.json` and `src/` directly, without another nested admin folder. Keep your current domain. Set the two `VITE_` variables above in the admin project's environment settings, then deploy. After Vercel gives the admin project its production domain, add that exact origin to `ADMIN_ORIGIN` in the storefront project and redeploy the storefront. If the admin URL changes, update `ADMIN_ORIGIN` accordingly.

The admin site is deliberately marked `noindex,nofollow`. Use the separate admin URL for product management. Login credentials are checked by the server, and the issued session token is held in `sessionStorage`.

## Product operations

Add and edit product details, category, image, price/label, featured flag and publication status. Drafts are excluded from the public catalogue; archived products are hidden and can be restored as drafts. A public HTTPS image URL can be entered directly. Photos selected from your computer are stored in PostgreSQL BYTEA. JPG, PNG and WebP up to 10 MiB are accepted; files larger than 2 MiB are optimized in the browser to fit within 2 MiB. GIF and AVIF must be at most 2 MiB. External image URLs still work. Cloudinary is not required.
