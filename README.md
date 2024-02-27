# Meetup Announcebot

<img width="100" height="100" src="https://raw.githubusercontent.com/kberg/meetup-announcebot/main/img/meetup-announcebot.png">

This bot scrapes a Meetup page of events, and posts notifications to an associated Discord guild.
(Guild is the internal term for what us mortals call Discord _servers_. Maybe you knew that, but
I didn't.)

To make this work, you'll need to copy `.env.sample` to `.env` and change its values according to
the instructions.

The bot will run by default every two hours, and publish any new events going live within six days.
The six-day limit is currently hard-coded but could be changed.

This bot will create a file called `history.json` which will keep track of how far into the future
it has looked for events. If you touch that, the bot might push new events.

## Notes for myself

* https://dev.to/fellipeutaka/creating-your-first-discord-bot-using-typescript-1eh6
* https://discordjs.guide
* https://stackoverflow.com/questions/45120618/send-a-message-with-discord-js
