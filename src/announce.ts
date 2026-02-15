import { Event, eventToString } from "./Event";
import { Env } from "./types";
import { parseWebhookUrls } from "./config";

function getWebhookUrl(env: Env, event: Event): string | undefined {
  const webhookUrls = parseWebhookUrls(env.WEBHOOK_URLS);
  const entry = Object.entries(webhookUrls).find(([regexp, _url]) => {
    return new RegExp(regexp, 'gi').test(event.title);
  });
  return entry?.[1] || env.DEFAULT_WEBHOOK_URL || undefined;
}

export async function announceMeetup(env: Env, event: Event): Promise<void> {
  console.log(`Announcing ${eventToString(event)}`);

  const webhookUrl = getWebhookUrl(env, event);
  if (webhookUrl === undefined) {
    console.log(`  No webhook URL matched, ignoring`);
    return;
  }
  console.log(`  Matched webhook URL: ${webhookUrl.substring(0, 60)}...`);

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

  try {
    if (env.FAKE_SEND) {
      console.log('  ** FAKE_SEND is enabled. NOT SENDING TO DISCORD **');
    } else {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        console.error(`  Webhook POST failed: ${response.status} ${response.statusText}`);
        return;
      }
    }
    console.log(`  Message sent.`);
  } catch (err) {
    console.error('  Error sending message:', err);
  }
}
