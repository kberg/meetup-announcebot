import { Client } from "discord.js";
import {scrapeMeetup} from "./scrape";
import {readHistory, writeHistory} from "./History";
import {announceMeetup} from "./announce";
import {config} from "./config";
import {eventToString} from "./Event";

const DAY_TO_SECONDS = 24 * 60 * 60;

export async function loop(client: Client<boolean>) {
  const events = await scrapeMeetup(config.MEETUP_NAME,/* test=*/ false);
  const history = readHistory();

  const nowMillis = new Date().getTime();
  const leadTimeMillis = config.LEAD_TIME_DAYS * DAY_TO_SECONDS * 1000;

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
  return Promise.all(filtered.map((event) => {
    return announceMeetup(client, event).then(() => history.posted.push(event.id));
  })).then(() => writeHistory(history));
}
