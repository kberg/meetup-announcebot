import * as https from 'https';
import {readFileSync} from 'fs';
import { parse } from 'node-html-parser';
import {RequestOptions} from 'http';
import {Event} from './Event';
import {config} from './config';


function httpsRequest(options: RequestOptions): Promise<string> {
  return new Promise(function(resolve, reject) {
    console.log('Calling : ' + JSON.stringify(options, undefined));
    const req = https.get(options, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        const redirectPath = new URL(response.headers.location, `https://${options.host}`).pathname;
        resolve(httpsRequest({...options, path: redirectPath}));
        return;
      }
      let responseData = '';
      response.on('data', (chunk) => {
        responseData += chunk;
      });
      response.on('end', () => {
        resolve(responseData);
      });
    });


    req.on('error', (err) => {
      console.log('err ' + err);
      reject(err);
      req.end();
    });
  });
}

export function scrapeMeetup(meetup: string, test: boolean = false): Promise<Array<Event>> {
  if (meetup.indexOf('/') != -1) {
    throw new Error('Invalid meetup string contains a slash')
  }
  if (test) {
    return Promise.resolve(readFileSync('test.html').toString()).then(parseResponse);
  } else if (config.SCRAPER === 'graphql') {
    return scrapeViaGraphQL(meetup);
  } else {
    const options = {
      host: 'www.meetup.com',
      port: 443,
      path: `/${meetup}/events/`,
      timeout: 10000, // 10s
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    };

    return httpsRequest(options).then(parseResponse);
  }
}

function scrapeViaGraphQL(meetup: string): Promise<Array<Event>> {
  const query = `{ groupByUrlname(urlname: "${meetup}") { events(first: 50, status: ACTIVE) { edges { node { id title dateTime eventUrl } } } } }`;
  const body = JSON.stringify({query});
  return new Promise(function(resolve, reject) {
    const options: RequestOptions = {
      host: 'api.meetup.com',
      port: 443,
      path: '/gql2',
      method: 'POST',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    console.log('Calling GraphQL API for ' + meetup);
    const req = https.request(options, (response) => {
      let responseData = '';
      response.on('data', (chunk) => { responseData += chunk; });
      response.on('end', () => {
        const json = JSON.parse(responseData);
        const edges = json.data.groupByUrlname.events.edges;
        resolve(edges.map((e: any) => Event.parse(e.node)));
      });
    });
    req.on('error', (err) => { reject(err); });
    req.write(body);
    req.end();
  });
}

function parseResponse(html: string): Array<Event> {
  const events: Array<Event> = [];
  const root = parse(html);
  const script = root.getElementById('__NEXT_DATA__')?.innerText;
  if (script === undefined) {
    throw new Error('Not script');
  }
  const json = JSON.parse(script);
  const items: any = json.props.pageProps.__APOLLO_STATE__;
  for (const key in items) {
    if (key.startsWith('Event:')) {
      const event = Event.parse(items[key]);
      events.push(event);
    }
  }
  return events;
}
