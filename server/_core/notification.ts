import { ENV } from "./env";

export type NotificationPayload = {
  title: string;
  content: string;
};

const TITLE_MAX_LENGTH = 1200;
const CONTENT_MAX_LENGTH = 20000;

const trimValue = (value: string): string => value.trim();
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

/**
 * Notify the site owner of an event (new project request, new client
 * message, etc). Sends an email via the Resend HTTP API. If email isn't
 * configured, this logs a warning and returns false instead of throwing —
 * a missing notification channel should never break the request that
 * triggered it.
 */
export async function notifyOwner(input: NotificationPayload): Promise<boolean> {
  if (!isNonEmptyString(input.title) || !isNonEmptyString(input.content)) {
    console.warn("[Notify] Skipped: title and content are required");
    return false;
  }

  const title = trimValue(input.title).slice(0, TITLE_MAX_LENGTH);
  const content = trimValue(input.content).slice(0, CONTENT_MAX_LENGTH);

  if (!ENV.resendApiKey || !ENV.notifyFromEmail || !ENV.notifyOwnerEmail) {
    console.warn(
      "[Notify] Skipped: set RESEND_API_KEY, NOTIFY_FROM_EMAIL, and NOTIFY_OWNER_EMAIL to enable owner email notifications.",
      { title, content }
    );
    return false;
  }

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENV.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: ENV.notifyFromEmail,
        to: ENV.notifyOwnerEmail,
        subject: title,
        text: content,
      }),
    });

    if (!resp.ok) {
      const body = await resp.text().catch(() => "");
      console.error(`[Notify] Resend request failed (${resp.status}): ${body}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Notify] Failed to send owner notification:", error);
    return false;
  }
}
