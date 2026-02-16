// Cloudflare Worker environment bindings and variables.
// Configured via wrangler.toml (vars/kv_namespaces) and `wrangler secret put` (secrets).
export interface Env {
  HISTORY_KV: KVNamespace;       // KV namespace for tracking which events have been announced
  MEETUP_NAME: string;           // Meetup group URL slug (e.g. "uptown-nyc-board-gamers")
  LEAD_TIME_DAYS: string;        // How many days ahead of an event to announce it
  WEBHOOK_URLS: string;          // JSON object mapping regex patterns to Discord webhook URLs
  DEFAULT_WEBHOOK_URL: string;   // Fallback webhook URL when no regex pattern matches
  FAKE_SEND?: string;            // When set, skip sending to Discord (for testing)
}
