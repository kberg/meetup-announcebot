import { z } from "zod";

export const Event = z.object({
  id: z.string(),
  title: z.string(),
  eventUrl: z.string().url(),
  dateTime: z.coerce.date(),
});

export type Event = z.infer<typeof Event>;

export function eventToString(e: Event) {
  return `(${e.id}) ${e.title} ${e.dateTime.toLocaleString()}`
}
