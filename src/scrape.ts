import * as https from 'https';
import {readFileSync} from 'fs';
import { parse } from 'node-html-parser';
import {RequestOptions} from 'http';
import {Event} from './Event';


function httpsRequest(options: RequestOptions): Promise<string> {
  return new Promise(function(resolve, reject) {
    console.log('Calling : ' + JSON.stringify(options, undefined));
    const req = https.get(options, (response) => {
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
  } else {
    const options = {
      host: 'www.meetup.com',
      port: 443,
      path: `/${meetup}/events/`,
      timeout: 10000, // 10s
    };

    return httpsRequest(options).then(parseResponse);
  }
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
