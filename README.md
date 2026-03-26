# CivicView 🏙️

> **Tu ciudad en un vistazo** — Dashboard cívico en tiempo real para Bogotá D.C.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/Licencia-MIT-green)](LICENSE)
[![SENA](https://img.shields.io/badge/SENA-Proyecto%20Final-orange)](https://www.sena.edu.co)

---

## Descripción

CivicView es una aplicación web que centraliza la información cívica más relevante de Bogotá D.C. en un único dashboard moderno e interactivo. El proyecto integra datos en tiempo real sobre calidad del aire, restricciones de tráfico (Pico y Placa), clima, eventos culturales y puntos de interés urbanos, permitiendo a los ciudadanos tomar decisiones informadas en su vida cotidiana.

Desarrollado como proyecto final para el **Tecnólogo en Análisis y Desarrollo de Software — SENA**, por **Jeyson Andrés Ortiz Mendoza** (2026).

---

## Capturas de pantalla

> *Dashboard principal con tema Neo-Táctil*

```
┌─────────────────────────────────────────────────────┐
│  CivicView          10:52:27  MIÉ, 25 MAR   • LIVE  │
├──────────┬──────────┬──────────┬────────────────────┤
│ Calidad  │ Pico y   │  Clima   │    Ciclorutas      │
│ del Aire │  Placa   │ Bogotá   │                    │
│   137    │ 6·7·8·9·0│   17°C   │      392 km        │
├──────────┴──┬───────┴───┬──────┴────────────────────┤
│Contaminantes│  Agenda   │    Mapa Interactivo        │
│  PM2.5 137  │ Cultural  │  • Ciclorutas              │
│  PM10   58  │           │  • Bibliotecas             │
│  NO₂     7  │           │  • Parques                 │
├─────────────┴───────────┴────────────────────────────┤
│     Eventos Hoy          │    Sedes · Bibliotecas    │
└──────────────────────────┴───────────────────────────┘
```

---

## Funcionalidades

### Módulos del dashboard

| Módulo | Descripción | Fuente de datos |
|--------|-------------|-----------------|
| **Calidad del Aire** | ICA global, contaminantes (PM2.5, PM10, NO₂, O₃), escala de referencia OMS/MAVDT, recomendaciones por categoría | AQICN API |
| **Pico y Placa** | Norma vigente 2026 — alternancia par/impar por fecha, franja única 6 AM–9 PM, countdown en tiempo real, consulta por dígito de placa | Cálculo local (SDM) |
| **Clima** | Temperatura, condición, pronóstico por hora y 7 días, brújula de viento, índice UV, fase lunar | OpenWeatherMap API |
| **Eventos Culturales** | Agenda cultural de Bogotá con calendario mensual, filtros por categoría y panel de detalle | Datos Abiertos Bogotá |
| **Mapa Interactivo** | Ciclorutas (polilíneas), bibliotecas, parques y centros culturales con panel lateral de lista | OpenStreetMap / Leaflet |
| **Ciclorutas** | Estado de la red de ciclorutas (392 km) | Estático / SDM |
| **Sedes Bibliotecas** | Estado de las 5 bibliotecas mayores de Bogotá | Datos Abiertos Bogotá |

### Características técnicas

- **Pico y Placa actualizado** — Norma 2026: franja única 6:00 AM–9:00 PM, lunes a viernes. Alternancia por paridad del día del mes (días impares: dígitos 6-7-8-9-0; días pares: dígitos 1-2-3-4-5). Motocicletas exentas (Decreto 003/2023).
- **Dashboard compacto** — Cards tipo widget que se expanden en modal al hacer clic, sin navegación de página.
- **Diseño Neo-Táctil** — Tema oscuro con fondo `#0d1520`, azul glacial `#38b6ff`, glassmorphism y gradientes sutiles.
- **Caché inteligente** — Todos los datos se cachean en `localStorage` con TTL por módulo para evitar llamadas redundantes a APIs.
- **Sin estado global** — Arquitectura simple con hooks por módulo (`useWeather`, `useAirQuality`, `useEvents`, `usePicoPlaca`).

---

## Stack tecnológico

```
Frontend
├── React 18.3          — UI declarativa con hooks
├── Vite 5.4            — Build tool y dev server
├── React Router DOM 7  — Enrutamiento (/ y /mapa)
├── Leaflet 1.9 + react-leaflet 4 — Mapa interactivo
├── Lucide React        — Librería de iconos
├── Axios 1.6           — Cliente HTTP
├── date-fns 3.3        — Utilidades de fecha/hora
└── Tailwind CSS 3.4    — Utilidades CSS (tokens)

Fuentes tipográficas (Google Fonts)
├── Syne          — Títulos y headings (700–800)
├── Barlow Condensed — Números grandes en display (700)
├── Plus Jakarta Sans — Cuerpo de texto
└── DM Mono       — Datos técnicos y monoespaciado

APIs externas
├── OpenWeatherMap  — Clima y pronóstico
├── AQICN           — Calidad del aire (ICA)
└── Datos Abiertos Bogotá (SOCRATA) — Eventos culturales
```

---

## Estructura del proyecto

```
civicview-frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx          # Reloj, logo, badge EN VIVO
│   │   │   └── Footer.jsx          # Créditos y fuentes
│   │   ├── dashboard/
│   │   │   ├── AirQuality.jsx      # Módulo calidad del aire
│   │   │   ├── PicoPlaca.jsx       # Módulo pico y placa
│   │   │   ├── Weather.jsx         # Módulo clima
│   │   │   ├── Events.jsx          # Módulo agenda cultural
│   │   │   └── MapPreview.jsx      # Widget mapa en dashboard
│   │   └── map/
│   │       └── InteractiveMap.jsx  # Mapa completo con panel lateral
│   ├── hooks/
│   │   ├── useWeather.js
│   │   ├── useAirQuality.js
│   │   ├── useEvents.js
│   │   └── usePicoPlaca.js
│   ├── pages/
│   │   ├── Home.jsx                # Dashboard principal
│   │   └── MapPage.jsx             # Página /mapa
│   ├── services/
│   │   ├── api.js                  # Instancias Axios centralizadas
│   │   ├── weatherService.js
│   │   ├── airQualityService.js
│   │   ├── eventsService.js
│   │   └── picoPlacaService.js     # Cálculo local (sin API)
│   ├── utils/
│   │   ├── constants.js            # Tokens, reglas P&P, config
│   │   ├── dateHelpers.js          # date-fns helpers
│   │   └── format.js               # Formateo de datos
│   ├── App.jsx                     # Rutas
│   ├── main.jsx                    # Entry point
│   ├── index.css                   # Estilos globales + fuentes
│   └── nebula.css                  # Variables del tema Neo-Táctil
├── package.json
├── vite.config.js
└── .env.example
```

---

## Instalación y uso

### Requisitos

- Node.js ≥ 18
- npm ≥ 9
- Claves de API (ver sección siguiente)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/civicview-frontend.git
cd civicview-frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus claves de API

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Abrir en el navegador
# http://localhost:3000
```

### Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en `localhost:3000` |
| `npm run build` | Build de producción en `/dist` |
| `npm run preview` | Vista previa del build de producción |
| `npm run lint` | Análisis estático con ESLint |

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto basado en `.env.example`:

```env
# Backend propio (si aplica)
VITE_BACKEND_URL=http://localhost:5000/api

# OpenWeatherMap — https://openweathermap.org/api
VITE_OPENWEATHER_API_KEY=tu_api_key_aqui
VITE_OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5

# AQICN — Calidad del Aire — https://aqicn.org/api/
VITE_AQICN_API_KEY=tu_api_key_aqui
VITE_AQICN_BASE_URL=https://api.waqi.info
```

> **Nota:** Las variables deben comenzar con `VITE_` para ser accesibles desde el código React. El módulo de Pico y Placa no requiere API externa — toda la lógica es calculada localmente según la normativa de la SDM.

---

## Norma de Pico y Placa (2026)

El módulo de Pico y Placa implementa la normativa vigente de la Secretaría Distrital de Movilidad de Bogotá:

| Aspecto | Norma vigente 2026 |
|---------|-------------------|
| **Horario** | 6:00 AM – 9:00 PM (franja única corrida) |
| **Días** | Lunes a viernes (sábados, domingos y festivos sin restricción) |
| **Lógica de dígitos** | Alternancia por paridad del día del mes |
| **Días impares** | Restringen placas terminadas en 6, 7, 8, 9, 0 |
| **Días pares** | Restringen placas terminadas en 1, 2, 3, 4, 5 |
| **Motocicletas** | Exentas (Decreto 003 de 2023) |
| **Vehículos eléctricos** | Exentos |
| **P&P Solidario** | Disponible en movilidadbogota.gov.co |
| **Multa 2026** | $633.200 + inmovilización (comparendo C-14) |

---

## Diseño — Sistema Neo-Táctil

El proyecto implementa el sistema de diseño **Neo-Táctil** con las siguientes especificaciones:

```css
/* Fondos */
--bg-primary:   #0d1520;  /* Fondo principal */
--bg-surface:   #111c2d;  /* Superficie de cards */

/* Colores de acento */
--blue:         #38b6ff;  /* Acento primario (marca) */
--cyan:         #38dcc8;  /* Acento secundario */
--green:        #50dc64;  /* Éxito / Bueno / Abierto */
--amber:        #f0b830;  /* Advertencia / Moderado */
--red:          #ff6680;  /* Peligro / Restricción */
--purple:       #d880ff;  /* Categoría / Cultural */

/* Tipografía */
--font-display: 'Syne', sans-serif;
--font-num:     'Barlow Condensed', 'Syne', sans-serif;
--font-body:    'Inter', 'Plus Jakarta Sans', sans-serif;
--font-mono:    'DM Mono', 'JetBrains Mono', monospace;
```

**Principios de diseño aplicados:**
- Colores semánticos estrictos (rojo = peligro, verde = bueno, ámbar = advertencia)
- Jerarquía tipográfica clara: los datos numéricos son siempre el elemento visual dominante
- Cards con gradiente sutil `145deg` para profundidad espacial
- Hover con glow del color de acento en el borde
- Grid consistente de 16px en todos los niveles

---

## Rutas

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | `Home.jsx` | Dashboard principal con todas las cards |
| `/mapa` | `MapPage.jsx` | Mapa interactivo a pantalla completa con panel lateral |

---

## Créditos y fuentes de datos

| Fuente | Uso | Enlace |
|--------|-----|--------|
| OpenWeatherMap | Clima y pronóstico | [openweathermap.org](https://openweathermap.org) |
| AQICN | Calidad del aire (ICA) | [aqicn.org](https://aqicn.org) |
| Datos Abiertos Bogotá | Eventos culturales | [datosabiertos.bogota.gov.co](https://datosabiertos.bogota.gov.co) |
| OpenStreetMap / CARTO | Tiles del mapa | [openstreetmap.org](https://www.openstreetmap.org) |
| SDM Bogotá | Normativa Pico y Placa | [movilidadbogota.gov.co](https://www.movilidadbogota.gov.co) |

---

## Autor

**Jeyson Andrés Ortiz Mendoza**
Tecnólogo en Análisis y Desarrollo de Software
Servicio Nacional de Aprendizaje — SENA
Bogotá D.C., Colombia · 2026

---

## Licencia

Este proyecto está bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">
  <sub>Hecho con ☕ y mucho código en Bogotá D.C.</sub>
</div>