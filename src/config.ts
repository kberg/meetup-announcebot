import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const isDigits = (value: string) => /^\d+$/.test(value);

const channelIdSchema = z.record(z.string().refine(isDigits));

function parseAndValidateJson(jsonString: string | undefined): z.infer<typeof channelIdSchema> {
  jsonString = jsonString ?? '{}';

  try {
    const data = JSON.parse(jsonString);
    const sp = channelIdSchema.safeParse(data);
    if (sp.success) {
      return sp.data;
    } else {
      throw new Error('Invalid parsing');
    }
  } catch (error) {
    throw new Error('Invalid JSON string or data structure');
  }
}

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1),
  MEETUP_NAME: z.string().min(1),
  DEFAULT_CHANNEL_ID: z.string().optional(),
  // CHANNEL_IDS: z.record(z.string().refine(isDigits)),
  SLEEP_TIME_SECONDS: z.coerce.number().default(7200), // 2 hours
  LEAD_TIME_DAYS: z.coerce.number().default(6.5),
  FAKE_SEND: z.string().optional(),
  SCRAPER: z.enum(['html', 'graphql']).default('html'),
});

const innerConfig = envSchema.parse(process.env);
const channelIds = parseAndValidateJson(process.env.CHANNEL_IDS);
export const config = {...innerConfig, CHANNEL_IDS: channelIds};
