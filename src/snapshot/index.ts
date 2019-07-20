import * as puppeteer from 'puppeteer';
import Worker from './worker';
import shuffle = require('lodash.shuffle');

let browser: puppeteer.Browser | null = null;
const workers: Worker[] = [];

interface UrlSource {
  url: string;
}

interface HtmlSource {
  html: string;
  url?: never;
}

export type Source = UrlSource | HtmlSource;

export const isSourceUrl = (source: Source): source is UrlSource => source.url != null;

export const init = async (pageLength: number) => {
  if (browser != null) return;

  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  browser.on('disconnected', () => {
    process.exit(-1);
  });
  for (let i = 0; i < pageLength; i++) {
    const newPage = await browser.newPage();
    workers.push(new Worker(newPage));
    newPage.on('error', () => {
      process.exit(-1);
    });
  }
};

export const publish = async (source: Source, viewport: puppeteer.Viewport): Promise<Buffer> => {
  const worker = await provideWorker();
  return await worker.print(source, viewport);
};

const provideWorker = async (): Promise<Worker> => {
  const shuffledWorkers = shuffle(workers);
  return await Promise.race(shuffledWorkers.map(worker => worker.waitForFinished()));
};
