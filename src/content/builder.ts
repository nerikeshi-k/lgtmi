import * as fs from 'fs';
import * as path from 'path';
import * as ejs from 'ejs';
import * as dotenv from 'dotenv';
import { Viewport } from 'puppeteer';

dotenv.config();

const templatesDir = path.join(process.cwd(), 'templates');
const templateFileName = 'main.ejs';

let templateMemorized: string | null = null;
const getTemplate = (): string => {
  // developmentモード時は毎回htmlを読みに行く
  if (templateMemorized != null && process.env.NODE_ENV !== 'development') {
    return templateMemorized;
  }
  templateMemorized = fs.readFileSync(path.join(templatesDir, templateFileName)).toString();
  return templateMemorized;
};

export const build = (url: string, viewport: Viewport): string => {
  return ejs.render(getTemplate(), { url, width: viewport.width, height: viewport.height });
};
