import { z } from "zod";

// "Event:299451154": {
//   "id": "299451154",
//   "title": "Sunday Night Gaming at Hex \u0026 Co. West",
//   "eventUrl": "https://www.meetup.com/uptown-nyc-board-gamers/events/299451154/",
//   "dateTime": "2024-03-17T17:00:00-04:00",
//   "createdTime": "2024-02-26T18:36:42-05:00"
//
//   "series": { "__typename": "Series" },
//    or
//   "series": null,
// },

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
