import { createServer } from 'node:http';

const port = Number(process.env.PORT ?? 4000);

createServer().listen(port);
