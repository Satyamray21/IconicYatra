import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json(
    {
        limit: "16kb"
    }

))
app.use(express.urlencoded(
    {
        extended: true,
        limit: "16kb"
    }
))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cookieParser());

export {app};