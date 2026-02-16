import { z } from "zod";

// WEBHOOK_URLS is a JSON object where keys are regex patterns matched against
// event titles, and values are Discord webhook URLs for the matching channel.
// Example: { "Board Game": "https://discord.com/api/webhooks/..." }
const webhookUrlSchema = z.record(z.string().url());

export function parseWebhookUrls(json: string): Record<string, string> {
  const data = JSON.parse(json);
  return webhookUrlSchema.parse(data);
}

export function getLeadTimeDays(leadTimeDaysStr: string): number {
  const n = Number(leadTimeDaysStr);
  if (isNaN(n) || n <= 0) {
    throw new Error(`Invalid LEAD_TIME_DAYS: ${leadTimeDaysStr}`);
  }
  return n;
}
