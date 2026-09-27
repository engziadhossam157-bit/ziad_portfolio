export const ENV = {
  // Base URL of this app (used to build OAuth redirect URIs). e.g. https://ziadhossam.com
  appUrl: process.env.APP_URL ?? "http://localhost:3000",

  // Session signing secret (JWT). Generate with: openssl rand -base64 48
  jwtSecret: process.env.JWT_SECRET ?? "",

  // Turso (libSQL) database. Get these from `turso db show <name> --url`
  // and `turso db tokens create <name>`.
  tursoUrl: process.env.TURSO_DATABASE_URL ?? "",
  tursoAuthToken: process.env.TURSO_AUTH_TOKEN ?? "",

  // Email address that should automatically become an admin on sign-up.
  ownerEmail: (process.env.OWNER_EMAIL ?? "").toLowerCase(),

  isProduction: process.env.NODE_ENV === "production",

  // Google OAuth (optional — Google login is disabled if unset)
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",

  // AWS S3 (file uploads / attachments)
  awsRegion: process.env.AWS_REGION ?? "",
  awsS3Bucket: process.env.AWS_S3_BUCKET ?? "",
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",

  // Outbound email for owner notifications (optional — notifications are
  // skipped with a console warning if unset). Uses the Resend HTTP API.
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  notifyFromEmail: process.env.NOTIFY_FROM_EMAIL ?? "",
  notifyOwnerEmail: process.env.NOTIFY_OWNER_EMAIL ?? "",
};
