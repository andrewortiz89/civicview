# 📊 Guía de Análisis de Métricas y KPIs — CivicView

El análisis de métricas permite evaluar el rendimiento tecnológico del sistema y medir el impacto social real en la rutina de los ciudadanos de Bogotá D.C. Esta guía detalla los Indicadores Clave de Rendimiento (KPIs) definidos para el proyecto, explica cómo explotar la base de datos para obtener analíticas técnicas y orienta sobre el uso de herramientas externas de monitoreo.

---

## 1. Cuadro de Mando de KPIs (Key Performance Indicators)

El éxito de CivicView se mide en tres dimensiones: técnica, usabilidad e impacto.

### 1.1 KPIs Técnicos (Infraestructura y Backend)
| KPI | Métrica Objetivo | Método de Medición | Frecuencia |
| :--- | :--- | :--- | :--- |
| **Tiempo de Respuesta API (Latencia)** | Promedio < 500ms | Analíticas de Render / Consultas en `api_logs` | Diaria |
| **Tasa de Acierto de Caché (Hit Rate)** | > 70% de peticiones servidas desde caché | Vista SQL `api_statistics` | Semanal |
| **Disponibilidad del Sistema (Uptime)**| > 99.5% de tiempo activo | Alertas y reportes de UptimeRobot | Mensual |
| **Tasa de Error de Peticiones** | < 2% de respuestas HTTP 4xx o 5xx | Conteo de estados en `api_logs` | Diaria |

### 1.2 KPIs de Usabilidad y Retención (Comportamiento del Usuario)
| KPI | Métrica Objetivo | Método de Medición | Frecuencia |
| :--- | :--- | :--- | :--- |
| **Usuarios Activos Mensuales (MAU)**  | 1.000+ usuarios activos en el Año 1 | Cohortes de Google Analytics 4 | Mensual |
| **Duración Promedio de la Sesión**     | Entre 30 y 90 segundos (Consulta rápida)| Google Analytics / Vercel Web Analytics | Semanal |
| **Tasa de Retención (Semana 2)**       | > 45% de regreso de usuarios | Análisis de Retención en Google Analytics | Mensual |
| **Interacción con el Mapa**            | > 30% de usuarios abren el mapa completo | Eventos personalizados de clics en GA4 | Semanal |

### 1.3 KPIs de Impacto Social
| KPI | Métrica Objetivo | Método de Medición | Frecuencia |
| :--- | :--- | :--- | :--- |
| **Ahorro de Tiempo Estimado**          | 8+ minutos diarios por usuario | Encuesta de usabilidad y grupo focal | Semestral |
| **Eficiencia de Costo por Usuario**    | $0 COP en infraestructura (Tier gratuito)| Reportes de costos de hosting y bases de datos | Mensual |

---

## 2. Análisis Técnico a Nivel de Base de Datos (SQL)

La base de datos de CivicView cuenta con telemetría incorporada a través de la tabla `api_logs` y procedimientos. A continuación, se detallan las consultas SQL listas para ser ejecutadas en MySQL Workbench o la consola de TiDB Cloud para auditar el sistema:

### 2.1 Consulta para Auditar la Tasa de Acierto de Caché (Caché Hit Rate)
Esta consulta utiliza la vista `api_statistics` generada en [schema.sql](file:///c:/Users/USUARIO/civicview-frontend/database/schema.sql) para evaluar qué porcentaje de peticiones a cada API externa (Clima, Calidad del Aire, Eventos) se sirvieron desde memoria o DB sin consumir cuotas externas:
```sql
SELECT 
  provider_name AS Proveedor,
  service_type AS Servicio,
  SUM(total_calls) AS 'Total Peticiones Recibidas',
  SUM(cache_hits) AS 'Peticiones Servidas desde Caché',
  ROUND((SUM(cache_hits) / SUM(total_calls)) * 100, 2) AS 'Tasa Acierto Caché (%)'
FROM api_statistics
WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY provider_name, service_type;
```
*💡 **Interpretación:** Una tasa de acierto superior al 75% indica que las políticas de expiración (TTL) son correctas y estamos ahorrando cuota diaria de API de manera eficiente.*

### 2.2 Consulta para Monitorear Tiempos de Respuesta y Latencia
Permite identificar si los endpoints del backend están respondiendo de manera ágil o si se presentan cuellos de botella en la red o base de datos:
```sql
SELECT 
  endpoint AS 'Ruta API',
  COUNT(id) AS 'Total de Consultas',
  MIN(response_time) AS 'Tiempo Mínimo (ms)',
  MAX(response_time) AS 'Tiempo Máximo (ms)',
  ROUND(AVG(response_time), 0) AS 'Tiempo Promedio (ms)',
  SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) AS 'Peticiones Fallidas'
FROM api_logs
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY endpoint
ORDER BY 'Tiempo Promedio (ms)' DESC;
```

### 2.3 Consulta para Control de Cuotas Diarias (API Rate Limiting)
Esta consulta ayuda a validar si el sistema está cerca de superar los límites de planes gratuitos de terceros en el día en curso:
```sql
SELECT 
  name AS Proveedor,
  service_type AS Servicio,
  current_usage_day AS 'Consumo Hoy',
  rate_limit_day AS 'Límite Diario Autorizado',
  ROUND((current_usage_day / rate_limit_day) * 100, 1) AS 'Porcentaje de Cuota Utilizado (%)'
FROM api_rate_limit_status;
```

---

## 3. Configuración de Herramientas de Analítica de Terceros

Para complementar las métricas de base de datos con el comportamiento del usuario en el navegador web, se recomiendan las siguientes herramientas gratuitas:

### 3.1 Vercel Web Analytics (Monitoreo de Performance y UX)
Al estar el frontend desplegado en Vercel, es la opción más sencilla y ligera para auditar las métricas de carga (Core Web Vitals):
1.  **Activación:** Ingresar al dashboard del proyecto en Vercel, ir a la pestaña *Analytics* y presionar *"Enable"*.
2.  **Código en Frontend:** Instalar el paquete SDK en el proyecto de React:
    ```bash
    npm install @vercel/analytics
    ```
    E inyectarlo en el archivo `src/main.jsx`:
    ```javascript
    import { inject } from '@vercel/analytics';
    inject();
    ```
3.  **Métricas Clave a vigilar:**
    *   **LCP (Largest Contentful Paint):** Tiempo en renderizar el widget principal (Meta: < 2.5s).
    *   **FID (First Input Delay):** Tiempo que tarda la web en responder a un clic en el mapa o botón (Meta: < 100ms).

### 3.2 Google Analytics 4 (Monitoreo de Comportamiento y Conversión)
Utilizado para medir de dónde provienen los usuarios (ej: LinkedIn, búsqueda directa, voz a voz) y qué localidad del mapa interactivo consultan más.
*   **Implementación en React (Vite):**
    Instalar `react-ga4`:
    ```bash
    npm install react-ga4
    ```
    Configurar la inicialización en `src/App.jsx` usando la Measurement ID de Google:
    ```javascript
    import ReactGA from "react-ga4";
    ReactGA.initialize("G-XXXXXXXXXX");
    ReactGA.send("pageview");
    ```

### 3.3 Monitoreo de Disponibilidad con UptimeRobot
Garantiza que el servidor Express en Render no sufra caídas silenciosas por inactividad o fallos de memoria:
1.  Crear una cuenta gratuita en [UptimeRobot.com](https://uptimerobot.com).
2.  Crear un monitor de tipo **HTTP(s)**.
3.  Configurar la URL de monitoreo apuntando al endpoint de salud del backend de CivicView:
    `https://civicview-backend.onrender.com/api/status`
4.  Establecer un intervalo de monitoreo de **5 minutos**.
5.  UptimeRobot enviará alertas automáticas por correo electrónico en caso de detectar caídas en el servidor.
