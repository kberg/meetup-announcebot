import { Client } from "discord.js";
import { config } from "./config";
import {loop} from "./loop";

const client = new Client({
  intents: ["Guilds", "GuildMessages"],
});

client.once("ready", async () => {
  console.log("Discord bot is ready! 🤖");
  try {
    await loop(client);
  } catch (err) {
    console.log(err);
  }
  setTimeout(async () => {
    await loop(client);
  }, config.SLEEP_TIME_SECONDS * 1000);
});

client.login(config.DISCORD_TOKEN);
