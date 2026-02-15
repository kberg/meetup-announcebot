# Meetup Announcebot

<img width="100" height="100" src="https://raw.githubusercontent.com/kberg/meetup-announcebot/main/img/meetup-announcebot.png">

This bot scrapes a Meetup page of events and posts notifications to Discord channels via webhooks. It runs as a Cloudflare Worker, triggered every 2 hours by a cron schedule.

## Setup

### Prerequisites

- A [Cloudflare](https://dash.cloudflare.com/) account
- [Node.js](https://nodejs.org/) installed
- Discord webhook URLs for your target channels

### 1. Install dependencies

```
npm install
```

### 2. Create a KV namespace

```
npx wrangler kv namespace create HISTORY_KV
```

Copy the resulting `id` into `wrangler.toml` under `[[kv_namespaces]]`.

### 3. Configure variables

Edit `wrangler.toml` and set `MEETUP_NAME` to your Meetup group's URL slug (e.g. `My-Gaming-Meetup`).

### 4. Set secrets

```
npx wrangler secret put DEFAULT_WEBHOOK_URL
npx wrangler secret put WEBHOOK_URLS
```

- `DEFAULT_WEBHOOK_URL`: The Discord webhook URL for events that don't match any pattern.
- `WEBHOOK_URLS`: A JSON object mapping regex patterns to webhook URLs, e.g.:
  ```json
  {"^sunday": "https://discord.com/api/webhooks/111/aaa", "^saturday": "https://discord.com/api/webhooks/222/bbb"}
  ```

### 5. Local development

Copy `.dev.vars.sample` to `.dev.vars` and fill in the values, then:

```
npx wrangler dev
```

Trigger a run manually:
```
curl http://localhost:8787
```

Test the cron trigger:
```
npx wrangler dev --test-scheduled
curl http://localhost:8787/__scheduled
```

Set `FAKE_SEND=y` in `.dev.vars` to test without sending to Discord.

### 6. Deploy

```
npm run deploy
```

## How it works

The worker runs on a cron schedule (every 2 hours by default). Each invocation:

1. Scrapes the configured Meetup page for upcoming events
2. Checks Cloudflare KV for previously announced events
3. Filters events to those within the lead time window (default 6.5 days)
4. Posts new events to Discord via webhook, routing by event title regex
5. Records announced event IDs in KV (keeps last 100)
