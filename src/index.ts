import { createImage } from './painter';
import { getParams } from './query';
import express = require('express');
import fs = require('fs');
import path = require('path');

const INDEX_HTML_PATH = path.join(__dirname, 'static/html/index.html');
const PORT = process.env.LGTMI_PORT != null ? parseInt(process.env.LGTMI_PORT, 10) : 3000;
if (Number.isNaN(PORT)) {
  process.exit(-1);
}

const indexHTML = fs.readFileSync(INDEX_HTML_PATH).toString();

const app = express();

app.get('/', async (req, res) => {
  const params = getParams(req.query);
  if (params == null) {
    res.send(indexHTML);
    return;
  }
  const picture = await createImage(params.url, params.style);
  if (picture == null) {
    res.status(400).send('bad request');
    return;
  }
  res.type('png').send(picture);
});

app.listen(PORT, () => console.log(`🌟 running on port ${PORT}`));
