import { Env } from "./types";
import { runOnce } from "./loop";

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    console.log("Cron trigger fired");
    await runOnce(env);
  },

  async fetch(_request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    console.log("Manual trigger via HTTP");
    try {
      await runOnce(env);
      return new Response("OK", { status: 200 });
    } catch (err) {
      console.error(err);
      return new Response("Error: " + String(err), { status: 500 });
    }
  },
};
