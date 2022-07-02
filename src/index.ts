import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middleware';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
const port = process.env.EXPRESS_PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(routes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});