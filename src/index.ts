import * as factory from './snapshot';
import * as dotenv from 'dotenv';
import * as server from './server';

dotenv.config();

const PAGE_LENGTH = Number(process.env.PAGE_LENGTH);
const PORT = Number(process.env.PORT);

const main = async () => {
  await factory.init(PAGE_LENGTH);
  server.run(PORT);
};

main();
