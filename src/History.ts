import { z } from "zod";
import {existsSync, readFileSync, writeFileSync} from 'fs';

const historyFile = 'history.json';

export const History = z.object({
  posted: z.array(z.string()).default([]),
});

export type History = z.infer<typeof History>;

export function readHistory(): History {
  if (!existsSync(historyFile)) {
    writeHistory(History.parse({}));
  }
  const history = History.parse(JSON.parse(readFileSync(historyFile).toString()));

  // Keeping this file small, keeping only the most recent 100 entries (that are pushed on to the back)
  history.posted = history.posted.slice(-100);
  return history;
}

export function writeHistory(history: History): void {
  writeFileSync(historyFile, JSON.stringify(history));
}
