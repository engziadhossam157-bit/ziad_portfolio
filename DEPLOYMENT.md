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

1. Push this repo to GitHub.
2. In Render, create a new **Web Service** from the repo.
3. Build command: `pnpm install && pnpm build`
4. Start command: `pnpm start`
5. Add every environment variable from `.env.example` in the Render
   dashboard's Environment tab (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`,
   `JWT_SECRET`, `OWNER_EMAIL`, `AWS_*`, etc).
6. Deploy. Point your domain at the Render service and set `APP_URL` to
   match it (needed for the Google OAuth redirect URI, if you use it).

Render's free tier spins the service down after inactivity, causing a slow
first request (~30s cold start). A paid instance (~$7/mo) keeps it always on.
Railway or Fly.io work the same way if you'd rather use one of those instead.

## What still needs your attention after deploy

- **Profile photo**: `client/src/pages/Home.tsx` currently points at a
  placeholder SVG (`/images/profile-placeholder.svg`) since your real photo
  lived in Manus's storage and wasn't included in this export. Drop a real
  photo in `client/public/images/` and update the `PROFILE_IMAGE` constant,
  or build an admin upload flow that writes to S3 and use the returned URL.
- **AI project-brief assistant, image generation, voice transcription**:
  removed for this launch, as requested. The manual project-request form
  still works fully. These can be added back later against a real
  OpenAI/Anthropic API key if you want them.
- **Certificates/testimonials**: the site ships with empty states for these
  until you add real records through the database (or an admin content
  screen, if you build one later).
