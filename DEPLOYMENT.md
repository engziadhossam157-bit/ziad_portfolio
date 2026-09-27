# Deploying standalone (off Manus)

This app no longer depends on Manus's platform. It's a normal Node.js +
Express + Turso (SQLite) app. Here's what to set up to go live.

## 1. Database — Turso

[Turso](https://turso.tech) is a hosted SQLite (libSQL) database with a
generous free tier and fast edge reads — a good fit for a low-traffic
portfolio/client site.

```bash
# install the CLI
curl -sSfL https://get.tur.so/install.sh | bash

turso auth login
turso db create ziad-portfolio
turso db show ziad-portfolio --url        # -> TURSO_DATABASE_URL
turso db tokens create ziad-portfolio     # -> TURSO_AUTH_TOKEN
```

Then apply the schema:

```bash
pnpm install
pnpm db:push
```

This applies `drizzle/0000_outgoing_sway.sql` to your database.

## 2. Session secret

Generate a random secret and set it as `JWT_SECRET`:

```bash
openssl rand -base64 48
```

## 3. Email/password login

Works out of the box once `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` and
`JWT_SECRET` are set — no extra
setup. Set `OWNER_EMAIL` to your own email so your account is automatically
made an admin the first time you register with it.

## 4. Google login (optional)

If you want the "Continue with Google" button:

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an OAuth 2.0 Client ID, type "Web application".
3. Add an authorized redirect URI: `{APP_URL}/api/auth/google/callback`
   (e.g. `https://yourdomain.com/api/auth/google/callback`).
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from the credentials page.

Leave both blank to disable Google login — the button just won't show, and
email/password still works.

## 5. File storage — AWS S3

Attachments and uploads need a real S3 bucket:

1. Create an S3 bucket (any region).
2. Create an IAM user with `s3:PutObject` and `s3:GetObject` permissions
   scoped to that bucket.
3. Set `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.

The bucket can stay private — the app generates short-lived signed URLs
for downloads through its own `/storage/*` route.

## 6. Owner email notifications (optional)

New project requests and client messages can email you. Uses
[Resend](https://resend.com) (free tier is generous):

1. Sign up, verify a sending domain (or use their test domain while testing).
2. Set `RESEND_API_KEY`, `NOTIFY_FROM_EMAIL`, `NOTIFY_OWNER_EMAIL`.

Leave these blank to skip — the app just logs a warning instead of sending.
## 7. Deploy to Render

The repo includes a `render.yaml` Blueprint, so the quickest path is:

1. In Render, choose **New > Blueprint** and pick this GitHub repo.
2. Fill in the values Render asks for (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`,
   `APP_URL`, and any optional Google, AWS, or Resend keys). `JWT_SECRET` is
   generated for you.
3. Deploy. Every push to `main` redeploys automatically.

To set up a plain **Web Service** by hand instead:

1. Build command: `NODE_ENV=development pnpm install --frozen-lockfile && pnpm build`
2. Start command: `pnpm start`
3. Add the variables from `.env.example` in the Environment tab, **except
   `NODE_ENV`**: the start script already sets it, and setting it to
   `production` makes pnpm skip the dev dependencies the build needs.
4. Point your domain at the service and set `APP_URL` to match it (needed
   for the Google OAuth redirect URI, if you use it).

Render's free tier spins the service down after inactivity, causing a slow
first request (~30s cold start). A paid instance (~$7/mo) keeps it always on.
Railway or Fly.io work the same way if you'd rather use one of those instead.

## What still needs your attention after deploy

- **Profile photo**: the site uses `client/public/images/profile-ziad-portrait*`
  (a portrait crop of `profile-ziad-about.jpg`, served as WebP). To use a
  different photo, set **Profile image URL** in Admin > About, or replace
  those files and keep the same names (see `client/src/lib/profileImage.ts`).
- **AI project-brief assistant, image generation, voice transcription**:
  removed for this launch, as requested. The manual project-request form
  still works fully. These can be added back later against a real
  OpenAI/Anthropic API key if you want them.
- **Certificates/testimonials**: the site ships with empty states for these
  until you add real records through the database (or an admin content
  screen, if you build one later).
