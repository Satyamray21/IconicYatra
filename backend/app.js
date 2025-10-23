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

import leadOptionsRoutes from "./src/routers/leadOptionsRoutes.js";
app.use("/api/v1/lead-options", leadOptionsRoutes);
import staffRouter from "./src/routers/staff.router.js"
app.use('/api/v1/staff',staffRouter);

import associateRouter from "./src/routers/associate.router.js"
app.use('/api/v1/associate',associateRouter);

import paymentRouter from "./src/routers/payment.route.js"
app.use('/api/v1/payment',paymentRouter);

import calcualteAccommodationRouter from "./src/routers/calculateAccommodation.router.js"
app.use('/api/v1/accommodation',calcualteAccommodationRouter);
import statesAndCitiesRouter from "./src/routers/stateAndCity.router.js";
app.use("/api/v1/state", statesAndCitiesRouter);
import locationRouter from "./src/routers/location.router.js";
app.use("/api/v1/location", locationRouter);
import vehicleQuotationRouter from "./src/routers/quotation/vehicleQuotation.router.js";
app.use("/api/v1/vehicleQT",vehicleQuotationRouter);
import allCountryStatesAndCity from "./src/routers/allCountryStatesAndCity.router.js";
app.use("/api/v1/countryStateAndCity",allCountryStatesAndCity);

import FlightQuotationRouter from "./src/routers/quotation/flightQuotation.router.js";
app.use("/api/v1/flightQT",FlightQuotationRouter);

import hotelQuotationRouter from "./src/routers/quotation/hotelQuotation.router.js";
app.use("/api/v1/hotelQT",hotelQuotationRouter);

import customQuotationRouter from "./src/routers/quotation/customQuotation.router.js";  
app.use("/api/v1/customQT",customQuotationRouter);

import fullQuotationRouter from "./src/routers/quotation/fullQuotation.router.js";    
app.use("/api/v1/fullQT",fullQuotationRouter);

// ✅ Fix: Load JSON without import
const swaggerDocument = JSON.parse(fs.readFileSync("./swagger-output.json", "utf-8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export { app };
