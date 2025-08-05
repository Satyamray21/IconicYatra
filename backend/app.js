import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use('/upload', express.static(path.join(__dirname, '/upload')));

// Routes
import leadRouter from "./src/routers/lead.router.js"
app.use('/api/v1/lead',leadRouter);
import staffRouter from "./src/routers/staff.router.js"
app.use('/api/v1/staff',staffRouter);

import associateRouter from "./src/routers/associate.router.js"
app.use('/api/v1/associate',associateRouter);

// ✅ Fix: Load JSON without import
const swaggerDocument = JSON.parse(fs.readFileSync("./swagger-output.json", "utf-8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export { app };
