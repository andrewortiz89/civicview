# 🚀 Plan de Lanzamiento Piloto — CivicView

El lanzamiento piloto es un paso crítico en la Fase 5 del proyecto **CivicView**. Su objetivo principal es validar la estabilidad técnica del sistema, la precisión de los datos y la utilidad percibida por los ciudadanos en un entorno de producción real, previo al lanzamiento masivo. El piloto está proyectado para ejecutarse durante un periodo de **4 semanas**.

---

## 1. Objetivos del Piloto
*   **Técnico:** Probar el comportamiento del middleware en Render y la base de datos en TiDB Cloud ante accesos simultáneos y monitorear la efectividad de la tasa de acierto (*cache hit rate*) de las APIs externas.
*   **Funcional:** Asegurar que el cálculo de Pico y Placa (Norma 2026) sea 100% preciso en todos los días de la semana y que los marcadores del mapa carguen fluidamente en dispositivos móviles de gama baja y media.
*   **De Impacto:** Validar si el uso diario de CivicView reduce el tiempo de consulta de los usuarios (meta: ahorro de al menos 8 minutos diarios por usuario).

---

## 2. Población Objetivo y Reclutamiento (Early Adopters)
Para optimizar el volumen y calidad de la retroalimentación, nos enfocaremos en segmentos con necesidades cívicas y geográficas específicas de Bogotá D.C.:

### 2.1 Perfil Geográfico: Barrio El Tintal (Localidad de Kennedy)
Tal como se planteó en la justificación del proyecto, el barrio **El Tintal** en Kennedy es un punto estratégico:
*   Es una zona con alta densidad demográfica, alta dependencia del transporte multimodal (bicicleta, TransMilenio, vehículo particular) y conectada por importantes ciclorutas.
*   Reclutaremos a 40 vecinos del sector de El Tintal que utilicen bicicleta o carro para desplazarse diariamente hacia su trabajo o estudio.

### 2.2 Perfil Académico y Tecnológico: Estudiantes del SENA y Universidades
*   **Comunidad SENA:** Enrolaremos a 60 estudiantes del SENA (especialmente de áreas de software y tecnologías) en Bogotá para que actúen como beta testers técnicos que puedan reportar bugs de interfaz.
*   **Ciclistas Universitarios:** Estudiantes de universidades de la zona centro o Teusaquillo que usen la red de ciclorutas de Bogotá.

### 2.3 Conductores Particulares
*   Conductores de carros particulares afectados por el horario continuo de Pico y Placa (6:00 AM - 9:00 PM) para validar la utilidad del widget de consulta por placa.

---

## 3. Cronograma del Lanzamiento Piloto (4 Semanas)

```
[Semana 1: Técnica] ----> [Semana 2: Beta Cerrada] ----> [Semana 3: Beta Abierta] ----> [Semana 4: Evaluación]
Reclutamiento 100 testers    50 usuarios activos         150 usuarios activos       Feedback & Cierre
```

### 3.1 Semana 1: Configuración Técnica e Infraestructura
*   **Setup de Analíticas:** Habilitar Vercel Web Analytics y Google Analytics 4 en el frontend para monitorear el comportamiento de navegación (páginas más visitadas, tiempo en pantalla, tipo de dispositivo).
*   **Activación del Procedimiento de Limpieza:** Verificar la ejecución del procedimiento almacenado `clean_expired_cache` en TiDB Cloud para garantizar que los registros obsoletos no degraden las consultas de caché del clima y eventos.
*   **Enrolamiento:** Contactar y confirmar a los primeros 100 usuarios evaluadores beta mediante un enlace de invitación por correo o WhatsApp.

### 3.2 Semana 2: Lanzamiento de Beta Cerrada (Grupo Seleccionado)
*   **Acceso Restringido:** Envío de la URL estable de producción ([https://civicview.vercel.app](https://civicview.vercel.app)) a los 100 evaluadores enrolados.
*   **Monitoreo del Backend:** Revisar la consola de Render y hacer consultas periódicas a la vista `api_rate_limit_status` en la base de datos para confirmar que no se sobrepasen los límites de 1.000 peticiones diarias en OpenWeatherMap y AQICN.
*   **Soporte:** Creación de un canal rápido de Telegram/WhatsApp para reportar errores de carga ("tarjeta en blanco", mapa que no renderiza, etc.).

### 3.3 Semana 3: Apertura Controlada (Beta Abierta)
*   **Aumento de Tráfico:** Incentivar a los evaluadores iniciales a compartir el enlace con familiares y compañeros de trabajo residentes en Bogotá. Objetivo: Alcanzar entre 150 y 250 usuarios activos.
*   **Validación de Pico y Placa:** Ejecutar un test exhaustivo cruzando la fecha de consulta local del cliente con las reglas en base de datos.
*   **Envío de Encuesta Media:** A mitad de la semana, enviar un formulario digital (Google Forms) enfocado en usabilidad (escala SUS) y estimación del tiempo ahorrado por el uso de la plataforma.

### 3.4 Semana 4: Análisis de Resultados e Iteración de Cierre
*   **Consolidación de Métricas:** Descarga y análisis de analíticas de Vercel (Latencia, TTI, First Contentful Paint) y consulta a la vista `api_statistics` para cuantificar la tasa de acierto de caché.
*   **Corrección de Bugs:** Solucionar problemas visuales o lógicos prioritarios descubiertos durante el piloto.
*   **Cierre de Etapa:** Redacción del informe del piloto para presentar al comité evaluador del SENA.

---

## 4. Estrategia de Recolección de Feedback

Para obtener datos de calidad que justifiquen el impacto del proyecto ante el SENA, utilizaremos tres canales:

1.  **Formulario de Google Forms Integrado (Cualitativo y Cuantitativo):**
    Enviado al final de la Semana 3. Incluirá preguntas clave como:
    *   *¿Cuántas aplicaciones solías abrir para saber el Pico y Placa, el Clima y la Calidad del Aire antes de CivicView?*
    *   *¿Cuánto tiempo consideras que te ahorra usar CivicView diariamente? (Opciones: 1-3 min, 3-5 min, 5-10 min, +10 min).*
    *   *Evaluación de usabilidad (Escala del 1 al 5 en simplicidad visual).*
2.  **Bitácora de Logs de Error (Técnico):**
    El backend registrará de manera automatizada en la tabla `api_logs` cualquier respuesta con código HTTP `>= 400` proveniente de las APIs externas, lo que permitirá auditar la estabilidad y la respuesta del sistema de reintentos (*retry mechanism*).
3.  **Grupo Focal Rápido (Vecinos de El Tintal):**
    Una sesión breve virtual o presencial de 15 minutos con 5 vecinos reclutados en Kennedy para observar cómo interactúan con el mapa de ciclorutas en sus teléfonos móviles.

---

## 5. Criterios de Éxito del Piloto (Exit Criteria)
Para dar por exitoso el lanzamiento piloto y proceder al cierre formal del proyecto, se deben cumplir los siguientes indicadores:

| Métrica | Objetivo Mínimo | Herramienta de Medición |
| :--- | :--- | :--- |
| **Usuarios Activos únicos** | 100+ durante el periodo piloto | Google Analytics / Vercel |
| **Uptime de la Plataforma** | >99% de disponibilidad | Monitor de Render / UptimeRobot |
| **Precisión de Pico y Placa** | 100% libre de discrepancias legales | Reportes en canal de soporte |
| **Latencia promedio Backend**| <2 segundos (con caché habilitado) | Logs en la base de datos |
| **Ahorro de Tiempo Promedio**| >8 minutos diarios por ciudadano | Resultados de encuestas de usuarios |
| **Retención Semanal** | >40% de regreso de usuarios en la segunda semana | Cohortes en Google Analytics |
