import { z } from "zod";

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
