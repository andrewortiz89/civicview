// server/server.js
if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { testConnection } from "./config/database.js";
import { cacheStats, cacheFlush } from "./services/cacheService.js";
import { resetHourlyCounters } from "./services/apiService.js";

import weatherRoutes from "./routes/weather.js";
import airQualityRoutes from "./routes/airQuality.js";
import eventsRoutes from "./routes/events.js";

import { generalLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

// ── App ───────────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== "production";

// ── Seguridad y utilidades ────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "DELETE", "OPTIONS"],
    credentials: false,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(morgan(isDev ? "dev" : "combined"));
app.use(generalLimiter);

// ── Rutas API ─────────────────────────────────────────────────────────────────
app.use("/api/weather", weatherRoutes);
app.use("/api/air-quality", airQualityRoutes);
app.use("/api/events", eventsRoutes);

// ── Health check / Status ─────────────────────────────────────────────────────
app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    version: "1.0.0",
    env: process.env.NODE_ENV || "development",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    cache: cacheStats(),
    apis: {
      weather: !!process.env.OPENWEATHER_API_KEY,
      airQuality: !!process.env.AQICN_API_KEY,
      events: true, // Socrata no requiere key
    },
  });
});

// ── Admin: limpiar TODO el caché en memoria ───────────────────────────────────
app.delete("/api/cache/all", (req, res) => {
  cacheFlush();
  res.json({ message: "Caché en memoria limpiado completamente" });
});

// ── 404 y errores ─────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Inicio ────────────────────────────────────────────────────────────────────
async function start() {
  // Conectar DB (no bloquea si falla)
  await testConnection();

  // Resetear contadores de uso de APIs al iniciar
  await resetHourlyCounters();

  // Resetear contadores cada hora
  setInterval(resetHourlyCounters, 60 * 60 * 1000);

  app.listen(PORT, () => {
    console.log(
      `\n🏙️  CivicView Backend corriendo en http://localhost:${PORT}`,
    );
    console.log(`📋 Endpoints:`);
    console.log(`   GET  /api/weather`);
    console.log(`   GET  /api/air-quality`);
    console.log(`   GET  /api/events`);
    console.log(`   GET  /api/status`);
    console.log(`   DEL  /api/cache/all\n`);
  });
}

start();
