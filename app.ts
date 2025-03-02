import express from 'express';
import cors from 'cors';

import { initDB } from './database';
import Router from './routes/router';
import "dotenv/config";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", Router);

initDB();


export default app;