import { Env } from "./types";
import { scrapeMeetup } from "./scrape";
import { readHistory, writeHistory } from "./History";
import { announceMeetup } from "./announce";
import { getLeadTimeDays } from "./config";
import { eventToString } from "./Event";

const DAY_TO_SECONDS = 24 * 60 * 60;

export async function runOnce(env: Env): Promise<void> {
  const events = await scrapeMeetup(env.MEETUP_NAME);
  const history = await readHistory(env);

  const nowMillis = new Date().getTime();
  const leadTimeMillis = getLeadTimeDays(env.LEAD_TIME_DAYS) * DAY_TO_SECONDS * 1000;

  // Events later than maxEventTimeMillis are not soon enough to publish.
  const maxEventTimeMillis = nowMillis + leadTimeMillis;

  const filtered = events.filter((event) => {
    console.log('Reading ', eventToString(event));
    const entryTimeMillis = event.dateTime.getTime();
    if (history.posted.includes(event.id)) {
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

  await Promise.all(filtered.map((event) => {
    return announceMeetup(env, event).then(() => history.posted.push(event.id));
  }));

  await writeHistory(env, history);
}
