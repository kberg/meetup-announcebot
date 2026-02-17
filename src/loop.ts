import { Env } from "./types";
import { scrapeMeetup } from "./scrape";
import { readHistory, writeHistory } from "./History";
import { announceMeetup } from "./announce";
import { getLeadTimeDays, parseWebhookUrls } from "./config";
import { eventToString } from "./Event";

const DAY_TO_SECONDS = 24 * 60 * 60;

export async function runOnce(env: Env): Promise<void> {
  const events = await scrapeMeetup(env.MEETUP_NAME);
  const history = await readHistory(env);
  const webhookUrls = parseWebhookUrls(env.WEBHOOK_URLS);

  const nowMillis = new Date().getTime();
  const leadTimeMillis = getLeadTimeDays(env.LEAD_TIME_DAYS) * DAY_TO_SECONDS * 1000;

  // Events further out than LEAD_TIME_DAYS are not soon enough to announce.
  const maxEventTimeMillis = nowMillis + leadTimeMillis;

  const postedSet = new Set(history.posted);

  const filtered = events.filter((event) => {
    console.log('Reading ', eventToString(event));
    const entryTimeMillis = event.dateTime.getTime();
    if (postedSet.has(event.id)) {
      console.log("  Already posted");
      return false;
    }
    if (entryTimeMillis < nowMillis) {
      console.log("  Too late");
      return false;
    }
    if (entryTimeMillis > maxEventTimeMillis) {
      console.log("  Too early");
      return false;
    }
    return true;
  });

  const results = await Promise.allSettled(filtered.map((event) => {
    return announceMeetup(env, webhookUrls, event);
  }));

  for (let i = 0; i < results.length; i++) {
    if (results[i].status === "fulfilled") {
      history.posted.push(filtered[i].id);
    } else {
      console.error(`Failed to announce ${eventToString(filtered[i])}:`, (results[i] as PromiseRejectedResult).reason);
    }
  }

  await writeHistory(env, history);
}
