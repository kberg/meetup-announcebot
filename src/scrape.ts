import { Event } from './Event';

export async function scrapeMeetup(meetup: string): Promise<Array<Event>> {
  if (meetup.indexOf('/') != -1) {
    throw new Error('Invalid meetup string contains a slash');
  }

  const url = `https://www.meetup.com/${meetup}/events/`;
  console.log(`Fetching: ${url}`);
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'meetup-announcebot/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch meetup page: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  return parseResponse(html);
}

function parseResponse(html: string): Array<Event> {
  const events: Array<Event> = [];
  const match = html.match(/<script\s+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) {
    throw new Error('No __NEXT_DATA__ script tag found');
  }
  const json = JSON.parse(match[1]);
  const items: any = json.props.pageProps.__APOLLO_STATE__;
  for (const key in items) {
    if (key.startsWith('Event:')) {
      const event = Event.parse(items[key]);
      events.push(event);
    }
  }
  return events;
}
