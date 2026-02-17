import { Event, eventToString } from "./Event";
import { Env } from "./types";

function getWebhookUrl(webhookUrls: Record<string, string>, event: Event): string | undefined {
  const entry = Object.entries(webhookUrls).find(([regexp, _url]) => {
    return new RegExp(regexp, 'gi').test(event.title);
  });
  return entry?.[1];
}

export async function announceMeetup(env: Env, webhookUrls: Record<string, string>, event: Event): Promise<void> {
  console.log(`Announcing ${eventToString(event)}`);

  const matchedUrl = getWebhookUrl(webhookUrls, event);
  const webhookUrl = matchedUrl || env.DEFAULT_WEBHOOK_URL || undefined;
  if (webhookUrl === undefined) {
    console.log(`  No webhook URL matched, ignoring`);
    return;
  }
  const suffix = matchedUrl ? '' : ' (default)';
  console.log(`  Using webhook ${webhookUrl.substring(0, 60)}...${suffix}`);

  // Unix timestamp in seconds for Discord's dynamic timestamp formatting.
  // <t:TIMESTAMP:F> renders as full date/time, <t:TIMESTAMP:R> as relative ("in 3 days").
  const timestamp = Math.floor(event.dateTime.getTime() / 1000);

  const body = {
    username: "Meetup Announcebot",
    embeds: [{
      title: event.title,
      url: event.eventUrl,
      description: `Come join us for fun and games!\n\n:calendar_spiral: <t:${timestamp}:F>\n:clock3: <t:${timestamp}:R>`,
      color: 0xED1C40,
    }],
  };

  if (env.FAKE_SEND) {
    console.log('  ** Not sending to discord **');
    console.log();
    return;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Webhook POST failed: ${response.status} ${response.statusText}`);
  }
  console.log(`  Message sent.`);
  console.log();
}
