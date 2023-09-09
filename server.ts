import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
const notes = require('./routes/notes.ts')

dotenv.config();


const app: Express = express();
app.use(express.json())
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.use('/notes', notes);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});