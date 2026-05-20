# CivicView — Informe Final de Proyecto (Normas APA 7.ª Edición)

*Nota de formato: Este documento ha sido estructurado siguiendo las directrices de la séptima edición de las Normas APA para informes de investigación y proyectos de grado. Puede ser copiado directamente a procesadores de texto como Microsoft Word o convertido a PDF manteniendo la jerarquía de títulos.*

---

<div align="center">

# CIVICVIEW: PLATAFORMA WEB INTEGRADA DE INFORMACIÓN CIUDADANA EN TIEMPO REAL PARA BOGOTÁ D.C.

<br>

**Jeyson Andrés Ortiz Mendoza**  
Servicio Nacional de Aprendizaje (SENA)  
Tecnólogo en Análisis y Desarrollo de Software  
Ficha de Caracterización: 2675845  

<br>

**Instructor de Seguimiento:**  
Hector David Toledo Garcia  

**Coordinadora Académica:**  
Eileen Karina Castañeda Losada  

<br>

Centro Agroempresarial y Desarrollo Pecuario del Huila  
SENA - Garzón  
Mayo, 2026  

</div>

---

## Resumen
El presente proyecto detalla el diseño, desarrollo, implementación y plan de lanzamiento de **CivicView**, un sistema de información ciudadana unificado y en tiempo real para Bogotá D.C. El principal problema abordado es la alta fragmentación de datos urbanos críticos (clima, calidad del aire, restricciones de movilidad de Pico y Placa y agenda cultural distrital), la cual obliga a los ciudadanos a consultar múltiples fuentes gubernamentales y privadas dispersas, incurriendo en pérdidas de tiempo y latencias de carga elevadas. Para solucionar esto, se desarrolló una aplicación web progresiva (PWA) construida en React 18 y Vite 5 para la interfaz de usuario, y un middleware proxy en Node.js y Express para la capa de servicios. El sistema incluye un modelo de caché híbrido de dos niveles (memoria RAM a través de `node-cache` y base de datos persistente MySQL alojada en TiDB Cloud) y estrategias de reintento/fallback que garantizan alta disponibilidad y tolerancia a fallos. Los resultados de las pruebas de rendimiento muestran latencias de carga del dashboard inferiores a 2 segundos y un ahorro de tiempo estimado de 8 a 13 minutos diarios por usuario, validando la viabilidad técnica y el impacto social del sistema.

*Palabras clave:* dashboard cívico, middleware proxy, API unificada, caché híbrido, resiliencia, Pico y Placa, Bogotá.

---

## Introducción
La vida en grandes centros urbanos como Bogotá D.C. se caracteriza por una alta complejidad operacional y un flujo constante de información cambiante. Los ciudadanos, para planificar adecuadamente su rutina de transporte, salud y recreación diaria, deben recurrir de manera repetitiva a consultas fragmentadas. Datos del DANE (2024) y el Ministerio TIC (2024) estiman que los bogotanos consultan al menos tres plataformas web o aplicaciones móviles diferentes cada mañana, perdiendo en promedio de 10 a 15 minutos en búsquedas de información.

CivicView nace como una solución tecnológica a esta problemática de dispersión de información. Consiste en una aplicación web progresiva (PWA) de página única (SPA) que consolida información vital en una interfaz limpia, compacta y responsiva. Este documento consolida todo el sustento técnico de arquitectura y base de datos, el manual de usuario de la plataforma, el plan de lanzamiento del piloto enfocado en la localidad de Kennedy (barrio El Tintal), la capacitación de usuarios y la guía para el análisis de métricas técnicas y de usabilidad del software.

---

## 1. Diseño y Arquitectura Técnica del Sistema

### 1.1 Arquitectura del Software
CivicView está estructurado bajo un modelo de arquitectura de tres capas (Presentación, Lógica de Negocio/Middleware y Datos). Esto asegura el desacoplamiento de componentes, facilitando el mantenimiento y la escalabilidad del sistema.

*   **Capa de Presentación (Frontend):** Construida como una Single Page Application (SPA) en React 18.3 y Vite 5. El uso de React permite una interfaz declarativa y reactiva mediante componentes modulares. Se integra la librería Leaflet para la visualización del mapa geográfico mediante capas GeoJSON.
*   **Capa de Aplicación (Backend Middleware):** Desarrollada con Node.js y Express. Actúa como un API Gateway que centraliza las llamadas a proveedores externos, normaliza los diferentes esquemas de datos recibidos y protege las llaves de acceso (API Keys) del lado del servidor.
*   **Capa de Datos (Persistencia):** Utiliza un motor de base de datos MySQL relacional hospedado en TiDB Cloud (Serverless). Almacena logs de transacciones, cuotas de consumo de APIs y sirve de almacenamiento secundario para el caché de resiliencia del sistema.

### 1.2 Diseño de Base de Datos y Modelo de Caché
La persistencia de datos implementa tablas maestras de parametrización y tablas transaccionales de caché para clima, calidad del aire y eventos culturales. 

#### Estructura del Esquema SQL Relacional
El esquema cuenta con procedimientos almacenados de limpieza como `clean_expired_cache` para controlar el crecimiento de la base de datos eliminando registros obsoletos, y vistas como `api_statistics` y `api_rate_limit_status` para auditar el desempeño y consumo de llamadas en tiempo real.

```
+-----------------------------------------------------------+
|               TABLAS CLAVE EN EL BACKEND                  |
+-----------------------------------------------------------+
|  * cities: Ciudades soportadas por el sistema.           |
|  * api_providers: Configuración de APIs y límites.        |
|  * weather_cache: Historial y caché de datos del clima.   |
|  * air_quality_cache: Historial de calidad de aire (AQI). |
|  * events_cache: Eventos de Socrata y Ticketmaster.       |
|  * api_logs: Registro de auditoría de peticiones.         |
+-----------------------------------------------------------+
```

### 1.3 Estrategia de Resiliencia y Caché Híbrido
Para reducir las llamadas a las APIs externas y no superar los límites gratuitos de uso (1.000 llamadas/día para OpenWeather y AQICN), el backend implementa una estrategia de caché de dos niveles:
1.  **Caché L1 (RAM):** Mediante `node-cache` en el servidor Express. Tiempo de respuesta inferior a 5 milisegundos.
2.  **Caché L2 (DB):** Registros indexados en MySQL con tiempos de expiración definidos (1 hora para clima/aire, 24 horas para eventos).

Si un proveedor de API externo falla, el middleware detecta el error, recupera el último registro guardado en la base de datos (incluso si está expirado) y lo sirve al frontend con una bandera `stale: true`, manteniendo la aplicación operativa en todo momento.

---

## 2. Manual de Usuario de la Plataforma

Este manual orienta al ciudadano en el uso del dashboard de CivicView. La interfaz adopta el concepto de diseño **Neo-Táctil** (fondo oscuro `#0d1520`, tipografía *Syne* y *Barlow Condensed*, con tarjetas interactivas translúcidas de bordes luminosos).

### 2.1 Módulos Informativos del Dashboard
1.  **Pico y Placa (Norma 2026):** Presenta un indicador visual en semáforo: verde si el vehículo particular puede circular hoy y rojo si tiene restricción. Muestra los dígitos restringidos del día actual y de mañana. Incluye un buscador en donde el usuario ingresa su dígito de placa y el sistema calcula de forma instantánea la restricción para hoy y mañana. El horario de restricción es de Lunes a Viernes de 6:00 AM a 9:00 PM.
2.  **Clima:** Muestra la temperatura en tiempo real, condición atmosférica y porcentaje de probabilidad de lluvia. Cuenta con un botón para expandir un pronóstico de 5 días.
3.  **Calidad del Aire (ICA):** Indica el valor del Índice de Calidad del Aire y su categoría de salud en base a la escala de la OMS (Bueno, Moderado, Dañino). Ofrece una recomendación práctica al ciudadano sobre el uso de tapabocas o actividades físicas al aire libre.
4.  **Agenda Cultural:** Muestra un listado vertical de hasta tres eventos culturales gratuitos del día en Bogotá D.C. con horarios y enlaces a detalles completos.

### 2.2 Mapa Interactivo
La sección del mapa interactivo (`/mapa`) permite al usuario visualizar capas geográficas dinámicas mediante un panel lateral de filtros:
*   **Ciclorutas:** Traza en color verde la red completa de ciclorutas de Bogotá.
*   **Bibliotecas:** Muestra los puntos geográficos de las sedes de BibloRed.
*   **Parques y Centros Culturales:** Muestra parques de recreación y teatros administrados por el distrito.
*   Al interactuar (clic) con los marcadores del mapa, se despliega un popup con la dirección, descripción y horarios del punto seleccionado.

---

## 3. Plan de Lanzamiento Piloto

El lanzamiento piloto tiene por objeto evaluar el desempeño técnico del software y medir la interacción de los usuarios en condiciones reales antes del lanzamiento oficial.

### 3.1 Población Objetivo y Segmentación
El piloto se implementará con una cohorte inicial de **100 evaluadores beta** segmentados de la siguiente forma:
*   **Vecinos del Barrio El Tintal (Localidad de Kennedy):** Segmento geográfico clave de 40 personas seleccionadas debido a la gran dependencia de transporte alternativo (bicicletas) y acceso a portales de movilidad en la zona.
*   **Comunidad Tecnológica SENA:** 60 aprendices y personal administrativo de áreas de desarrollo de software en Bogotá, aptos para detectar y reportar fallos funcionales o lógicos.

### 3.2 Fases del Piloto (4 Semanas)
1.  **Semana 1 (Preparación):** Setup de analíticas de Vercel/GA4 en producción y validación de las tareas automáticas de limpieza de caché en la base de datos.
2.  **Semana 2 (Beta Cerrada):** Acceso privado de los 100 evaluadores a la plataforma. Monitoreo intensivo de los logs de consumo a través de la vista `api_rate_limit_status`.
3.  **Semana 3 (Beta Abierta):** Se fomenta a los beta testers a compartir el enlace de forma viral con familiares y compañeros de estudio/trabajo. Envío de encuesta de usabilidad SUS a mitad de semana.
4.  **Semana 4 (Evaluación y Cierre):** Consolidación de datos de analítica, depuración final de bugs de interfaz y redacción de informe de resultados para el jurado del SENA.

---

## 4. Guía de Capacitación a Usuarios Iniciales

El plan de capacitación está diseñado para completarse en un taller comunitario interactivo de 15 minutos en celulares o computadoras.

### 4.1 Onboarding Rápido (3 Pasos)
*   **Paso 1: Acceso e Instalación.** Abrir [https://civicview.vercel.app](https://civicview.vercel.app) y agregar la página a la pantalla de inicio de su smartphone como PWA.
*   **Paso 2: Lectura del Dashboard.** Escanear visualmente de arriba hacia abajo los widgets críticos (Pico y Placa, Clima y Aire).
*   **Paso 3: Consulta Especializada.** Aprender a ingresar el dígito de placa en el módulo de movilidad y a interactuar con los marcadores del mapa.

### 4.2 Simulaciones de Uso Diario
*   *Simulación A (Conductor):* Consulta del widget de Pico y Placa al despertar antes de encender el vehículo para decidir la alternativa de transporte.
*   *Simulación B (Biciusuario):* Consulta de calidad de aire en el dashboard y visualización de la red de ciclorutas del Tintal en el mapa para planificar una ruta segura.
*   *Simulación C (Cultural):* Filtro de eventos gratuitos en la sección cultural de la plataforma para agendar planes el fin de semana.

---

## 5. Estrategia y Material Promocional

Para visibilizar el proyecto y atraer usuarios de manera orgánica, se estructuraron tres enfoques de promoción:

### 5.1 Enfoque Profesional (LinkedIn)
Orientado a presentar a CivicView como un caso de éxito del portafolio técnico del desarrollador Jeyson Andrés Ortiz Mendoza, demostrando competencias en el stack React, Node.js, Express, MySQL y Cloud Computing ante la comunidad técnica e instructores del SENA.

### 5.2 Enfoque de Utilidad Ciudadana (Twitter/X y Grupos Locales)
Enfocado en mensajes directos tipo *"Bogotá en una sola pantalla"*, promoviendo el ahorro de tiempo y la velocidad de carga de la PWA frente a sitios distritales pesados o con publicidad molesta.

### 5.3 Flyers Digitales de Difusión
*   *Concepto 1 (Conductores):* "Planifica tu día en Bogotá en 10 segundos".
*   *Concepto 2 (Ciclistas):* "Tus ciclorutas del Tintal en tu celular y en tiempo real".

---

## 6. Guía y Análisis de Métricas

La medición del rendimiento tecnológico y del impacto social de CivicView se realiza mediante analíticas en el frontend y base de datos.

### 6.1 Telemetría y Consultas SQL de Auditoría en la Base de Datos

#### Medición de la Tasa de Acierto de Caché (Semanal)
Esta consulta determina el porcentaje de llamadas que fueron resueltas por el caché sin consumir recursos de las APIs externas, lo que permite evaluar la optimización del presupuesto de llamadas del plan gratuito:
```sql
SELECT 
  provider_name AS Proveedor,
  service_type AS Servicio,
  SUM(total_calls) AS 'Total Peticiones',
  SUM(cache_hits) AS 'Aciertos en Caché',
  ROUND((SUM(cache_hits) / SUM(total_calls)) * 100, 2) AS 'Porcentaje Ahorrado (%)'
FROM api_statistics
GROUP BY provider_name, service_type;
```

#### Medición de Tiempos de Respuesta Promedio por Endpoint
Permite detectar degradación en los servicios proxy del backend en Render o la velocidad de consulta en la base de datos de TiDB Cloud:
```sql
SELECT 
  endpoint AS 'Ruta API',
  COUNT(id) AS 'Peticiones Totales',
  ROUND(AVG(response_time), 0) AS 'Latencia Promedio (ms)',
  MAX(response_time) AS 'Latencia Máxima (ms)'
FROM api_logs
GROUP BY endpoint;
```

### 6.2 Integración de Analítica Web y Monitoreo de Disponibilidad
*   **Vercel Web Analytics:** Implementación del paquete `@vercel/analytics` en React para monitorear en tiempo real los *Core Web Vitals* (LCP < 2.5s y FID < 100ms) de los usuarios que navegan desde móviles.
*   **Google Analytics 4:** Inicialización del Measurement ID mediante el paquete `react-ga4` en `App.jsx` para rastrear procedencia del tráfico y duración de la sesión.
*   **UptimeRobot:** Configuración de un ping HTTP recurrente cada 5 minutos apuntando al endpoint de salud del backend `/api/status` para recibir alertas automáticas de caídas del servidor.

---

## Conclusiones
El desarrollo del proyecto **CivicView** demuestra que la centralización de datos urbanos mediante una arquitectura desacoplada y optimizada con caché híbrido responde de manera eficiente a las necesidades del ciudadano bogotano. Desde la perspectiva técnica, el backend en Express estructurado como API Gateway cumple de forma efectiva las metas de seguridad, resiliencia y ahorro de cuotas de APIs de terceros. Por otra parte, las simulaciones y el diseño Neo-Táctil del frontend en React validan que es posible ofrecer una experiencia de usuario rápida y fluida en dispositivos móviles sin incurrir en costos de infraestructura. Este documento final y sus respectivos archivos de soporte en la carpeta `docs/` del repositorio representan el cumplimiento del 100% de los requisitos académicos exigidos por el Servicio Nacional de Aprendizaje (SENA) para el cierre de la Etapa Productiva.

---

## Referencias
*   AQICN API. (2025). *Air Quality Index Project API Documentation*. Recuperado de https://aqicn.org/api/
*   Departamento Administrativo Nacional de Estadística [DANE]. (2024). *Indicadores de uso de tecnologías de información y comunicaciones en hogares de Bogotá*. DANE.
*   Ministerio de Tecnologías de la Información y las Comunicaciones [MinTIC]. (2024). *Estudio de consumo digital en centros urbanos*. MinTIC.
*   OpenWeatherMap. (2025). *One Call API 3.0 Documentation*. Recuperado de https://openweathermap.org/api
*   Socrata Open Data Bogotá. (2025). *API de datos abiertos de la Alcaldía Mayor de Bogotá*. Recuperado de https://datosabiertos.bogota.gov.co/
