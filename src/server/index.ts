import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as snapshot from '../snapshot';
import { build } from '../content/builder';
import { getImage } from '../content/image';

interface Query {
  url: string;
}

const indexPagePath = 'indexpage/index.html';

const isQueryPerfect = (queryPartial: Partial<Query>): queryPartial is Query => queryPartial.url != null;

const extractQuery = (query: Partial<Query>): Query | null => {
  if (!isQueryPerfect(query)) {
    return null;
  }
  return {
    url: decodeURIComponent(query.url)
  };
};

export const run = (port: number) => {
  const app = express();

  app.get('/', async (req, res) => {
    const query = extractQuery(req.query);
    if (query == null) {
      const indexPage = fs.readFileSync(path.join(process.cwd(), indexPagePath)).toString();
      res.send(indexPage);
      return;
    }
    try {
      const { url, viewport } = await getImage(query.url);
      const html = build(url, viewport);
      const picture = await snapshot.publish({ html }, viewport);
      res.type('jpeg').send(picture);
    } catch (err) {
      console.log(err);
      res.status(400).send('bad request');
    }
  });

  app.listen(port, () => console.log(`🌟 app server is listening on port ${port}`));
};
