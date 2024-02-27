import {Client, TextChannel} from "discord.js";
import {Event, eventToString} from "./Event";
import {config} from "./config";

function getChannelId(client: Client<boolean>, event: Event): string | undefined {
  const e = Object.entries(config.CHANNEL_IDS).find(([regexp, _channelId]) => {
    return new RegExp(regexp, 'gi').test(event.title)
  });
  return e?.[1] || config.DEFAULT_CHANNEL_ID;
}

export async function announceMeetup(client: Client<boolean>, event: Event): Promise<void> {
  const title = event.title;
  console.log(`Announcing ${eventToString(event)}`);

  const channelId = getChannelId(client, event);
  if (channelId === undefined) {
    console.log(`  No channel provided, ignoring`);
    return;
  }
  console.log(`  Matching channel id: ${channelId}`);
  const channel = client.channels.cache.get(channelId) as TextChannel | undefined;
  if (!channel) {
    console.error('  Could not find channel with ID ', channelId);
    return;
  }

  console.log(`  delivering to: ${channel.name}`);

  const message = `🤖 **Attention: here's the next meetup! Come join us for fun and games.**

  ${event.title}
  ${event.eventUrl}
  `;
  try {
    if (config.FAKE_SEND) {
      console.log('  ** FAKE_SEND is enabled. NOT SENDING TO DISCORD **');
    } else {
      await channel.send(message);
    }
    console.log(`  Message sent.`);
  } catch (err) {
    console.error('  Error sending message:', err);
  }
}
