# 🏙️ CivicView

**Plataforma Web Integrada de Información Ciudadana en Tiempo Real — Bogotá D.C.**

> Proyecto de grado · Tecnólogo en Análisis y Desarrollo de Software  
> SENA — Centro Agroempresarial y Desarrollo Pecuario del Huila · 2025

---

## ¿Qué es CivicView?

CivicView centraliza la información ciudadana más relevante de Bogotá en un único dashboard: clima, calidad del aire, Pico y Placa, eventos culturales y mapa interactivo de puntos de interés.

## Módulos

| Módulo | Fuente | Actualización |
|---|---|---|
| 🌤️ Clima | OpenWeatherMap API | Cada hora |
| 💨 Calidad del Aire | AQICN API | Cada hora |
| 🚗 Pico y Placa | Lógica local (Decreto 190) | Diaria |
| 🎭 Eventos culturales | Datos Abiertos Bogotá + Ticketmaster | Cada 6 horas |
| 🗺️ Mapa interactivo | Leaflet + OpenStreetMap | Estático |

## Stack tecnológico

**Frontend:** React 18 · Vite · TailwindCSS · Leaflet  
**Backend:** Node.js · Express · node-cache  
**Base de datos:** MySQL 8 / MariaDB  
**APIs:** OpenWeatherMap · AQICN · Datos Abiertos Bogotá · Ticketmaster

---

## Instalación

### Requisitos
- Node.js 20+
- MySQL 8 / MariaDB (XAMPP)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/civicview.git
cd civicview
```

### 2. Configurar el Frontend

```bash
cd frontend
cp .env.example .env        # Editar con tus API keys
npm install
npm run dev                 # http://localhost:3000
```

### 3. Configurar el Backend

```bash
cd backend
cp .env.example .env        # Editar con tus credenciales
npm install
```

### 4. Crear la base de datos

```bash
# Desde MySQL Workbench o consola:
mysql -u root -p < database/schema_final.sql
```

### 5. Iniciar el backend

```bash
cd backend
npm run dev                 # http://localhost:5000
```

---

## Variables de entorno

Copia los archivos `.env.example` y renómbralos a `.env`:

- `frontend/.env.example` → `frontend/.env`
- `backend/.env.example` → `backend/.env`

**Las claves API necesarias:**
- **OpenWeatherMap:** [openweathermap.org/api](https://openweathermap.org/api) (gratis, 1.000 calls/día)
- **AQICN:** [aqicn.org/api](https://aqicn.org/api) (gratis, 1.000 calls/día)
- **Ticketmaster** *(opcional)*: [developer.ticketmaster.com](https://developer.ticketmaster.com) (gratis, 5.000 calls/día)

---

## Estructura del proyecto

```
civicview/
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── components/     # Header, PicoPlaca, Weather, AirQuality, Events, Map
│   │   ├── hooks/          # useWeather, useAirQuality, useEvents, usePicoPlaca
│   │   ├── services/       # weatherService, airQualityService, eventsService
│   │   ├── utils/          # constants, dateHelpers, format
│   │   └── pages/          # Home, MapPage
│   ├── .env.example
│   └── package.json
│
├── backend/                # Node.js + Express
│   ├── controllers/        # weatherController, airQualityController, eventsController
│   ├── routes/             # weather, airQuality, events
│   ├── services/           # cacheService, apiService
│   ├── middleware/         # errorHandler, rateLimiter
│   ├── config/             # database.js
│   ├── .env.example
│   └── server.js
│
├── database/
│   └── schema_final.sql    # Schema MySQL completo
│
└── README.md
```

---

## Endpoints del Backend

```
GET  /api/weather        Clima actual y pronóstico 5 días
GET  /api/air-quality    Índice de calidad del aire (ICA/AQI)
GET  /api/events         Eventos culturales próximos (30 días)
GET  /api/status         Estado del servidor y caché
DEL  /api/cache/all      Limpiar todo el caché en memoria
```

---

## Autor

**Jeyson Andrés Ortiz Mendoza**  
Tecnólogo en Análisis y Desarrollo de Software  
SENA — Centro Agroempresarial y Desarrollo Pecuario del Huila  
Diciembre 2025