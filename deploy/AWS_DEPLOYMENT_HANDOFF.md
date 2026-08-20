# AWS Deployment Handoff — Perfecttrans (SAdminPerfectras + VMS)

Currently deployed on Render.com; moving to AWS. This doc has everything
needed to stand it up on AWS. Database stays on the existing MongoDB Atlas
cluster — no DB migration needed.

## Architecture

- **1 backend**: Node.js/Express + Mongoose, single server serving both the
  CTRMS API (`/api/*`) and VMS API (`/api/vms/*`). Lives in `Backend/`.
  Runs on port 5001 by default (`PORT` env var).
- **2 frontends**: separate Vite/React SPAs, each built to static files
  and both calling the one backend above.
  - `SAdminPerfectras/` (root of this repo) → CTRMS admin UI
  - `VMS/` (sibling folder) → VMS UI
- **Database**: MongoDB Atlas (keep as-is, do not migrate to DocumentDB).
- **File uploads**: Cloudinary (already cloud-hosted, no S3 needed unless
  you want to migrate uploads later — not required for this deployment).

## Recommended AWS setup

- **EC2** (single instance is fine to start) running:
  - Node.js backend via **PM2** — config already at
    [Backend/ecosystem.config.cjs](../Backend/ecosystem.config.cjs)
  - **Nginx** as reverse proxy for the API + static file server for both
    frontend builds — example config at
    [deploy/nginx.conf.example](nginx.conf.example)
- **Route53 + ACM + Certbot/Let's Encrypt** for domains and HTTPS (domain
  not chosen yet — use placeholders below and swap in the real one).
- **Security Group**: open 80/443 (and 22 for SSH admin only, ideally
  restricted to a known IP).
- MongoDB Atlas: make sure Atlas Network Access allow-list includes the
  EC2 instance's static/Elastic IP (or 0.0.0.0/0 if acceptable for now).

## Steps

1. **Provision EC2** (Ubuntu recommended), attach an Elastic IP.
2. Install Node.js (match local dev version), PM2, Nginx, Certbot.
3. **Backend**:
   - Clone/copy `Backend/` to the instance.
   - Copy [Backend/.env.production.example](../Backend/.env.production.example)
     to `Backend/.env` and fill in real values (Mongo URI, Cloudinary
     keys, a **freshly generated** `JWT_SECRET` — do not reuse the local
     dev secret, generate with `openssl rand -hex 32`).
   - Set `CLIENT_ORIGIN` to a comma-separated list of the two frontend
     origins once domains are picked, e.g.
     `https://admin.yourdomain.com,https://vms.yourdomain.com`.
   - `npm install --production && pm2 start ecosystem.config.cjs`
   - `pm2 save && pm2 startup` so it survives reboots.
4. **Frontends** (build locally or on a CI runner, then upload `dist/`):
   - `SAdminPerfectras`: copy
     [.env.production.example](../.env.production.example) →
     `.env.production`, set `VITE_API_BASE_URL` to the real backend URL
     + `/api`, then `npm run build`. Deploy `dist/` to
     `/var/www/sadminperfectras/dist` on the instance (or to S3+CloudFront
     if you'd rather not serve static files from the same EC2 box).
   - `VMS`: same pattern, copy `.env.production.example` →
     `.env.production`, set `VITE_API_URL` to the real backend URL
     (no `/api` suffix — VMS appends its own paths), `npm run build`,
     deploy `dist/`.
5. **Nginx**: adapt
   [deploy/nginx.conf.example](nginx.conf.example), replacing
   `yourdomain.com` placeholders with the real domain(s) once assigned.
   Enable the sites, `nginx -t`, reload.
6. **HTTPS**: once DNS points at the instance, run
   `sudo certbot --nginx` for each server_name to get free TLS certs
   with auto-renewal.
7. **Smoke test**: hit `https://api.yourdomain.com/api/health` → should
   return `{ ok: true, message: "Server is running" }`. Then load both
   frontends and confirm login/API calls work (check browser console for
   CORS errors — if you see any, double check `CLIENT_ORIGIN` matches the
   frontend origins exactly, including scheme and no trailing slash).

## Known items already handled in code

- `Backend/server.js` CORS was hardcoded to `origin: "*"`; changed to
  read from `CLIENT_ORIGIN` (comma-separated, falls back to `*` only if
  literally set to `*`) so cookies/credentials work correctly across the
  two frontend origins.

## ⚠️ Security note — rotate before going live

The current `render.yaml` files in both repos have the MongoDB Atlas
connection string (including username/password) committed in plain text,
and the local `Backend/.env` has real Cloudinary keys and a JWT secret
checked in. Before/while moving to AWS:

- Rotate the MongoDB Atlas user password (`piyush_db_user`) and update
  the URI everywhere it's used, then remove the plaintext URI from
  `render.yaml` (use Render's env var UI instead, or delete the file
  once off Render).
- Generate a new `JWT_SECRET` for production (don't reuse the dev one).
- Rotate the Cloudinary API secret if this repo is or will be pushed to
  a shared/public remote.
- Confirm `.env` files are actually in `.gitignore` and were never
  pushed to a remote history that others can see.
