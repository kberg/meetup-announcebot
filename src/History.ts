import { z } from "zod";
import { Env } from "./types";

const HISTORY_KEY = "posted";

export const History = z.object({
  posted: z.array(z.string()).default([]),
});

export type History = z.infer<typeof History>;

export async function readHistory(env: Env): Promise<History> {
  const raw = await env.HISTORY_KV.get(HISTORY_KEY);
  if (raw === null) {
    return History.parse({});
  }
  const history = History.parse(JSON.parse(raw));
  // Keep only the most recent 100 entries (pushed on to the back)
  history.posted = history.posted.slice(-100);
  return history;
}

export async function writeHistory(env: Env, history: History): Promise<void> {
  await env.HISTORY_KV.put(HISTORY_KEY, JSON.stringify(history));
}
