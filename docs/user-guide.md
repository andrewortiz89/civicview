# 📖 Manual de Usuario — CivicView

Bienvenido a la guía oficial de usuario de **CivicView**, tu dashboard de información cívica y urbana de Bogotá D.C. en tiempo real. Este manual te enseñará a navegar por la interfaz, comprender los widgets informativos y aprovechar al máximo las herramientas interactivas del sistema.

---

## 1. ¿Qué es CivicView?
CivicView es una aplicación web intuitiva diseñada para centralizar los datos que necesitas consultar cada mañana antes de salir de casa. En lugar de abrir múltiples aplicaciones y portales del distrito, CivicView te permite visualizar en menos de 10 segundos:
- Si tu vehículo tiene restricción de **Pico y Placa** hoy y mañana.
- El estado del **clima** actual y el pronóstico detallado.
- El índice de **calidad del aire** (ICA) y sus recomendaciones de salud.
- La **agenda cultural** de eventos gratuitos en la ciudad.
- La red de **ciclorutas, parques públicos y bibliotecas** en un mapa interactivo.

---

## 2. Acceso y Requisitos
CivicView es una **Aplicación Web Progresiva (PWA)**, lo que significa que puedes acceder desde cualquier navegador web en tu smartphone, tablet o computadora a través de:
🔗 **Enlace web:** [https://civicview.vercel.app](https://civicview.vercel.app)

*   **Navegadores recomendados:** Google Chrome, Safari, Mozilla Firefox, Microsoft Edge (versiones actualizadas).
*   **Instalación como App:** En dispositivos móviles, puedes presionar "Agregar a pantalla de inicio" en el menú del navegador para instalar CivicView como una aplicación nativa sin consumir espacio de almacenamiento adicional.

---

## 3. Guía de Módulos del Dashboard

El dashboard principal está diseñado con una estructura compacta "Neo-Táctil" optimizada para móviles y computadoras.

```
+-----------------------------------------------------------+
|                      🏙️  CIVICVIEW                        |
+---------------------+---------------------+---------------+
|   🚗 Pico y Placa   |      ☁️ Clima        | 💨 Calidad Aire |
|  [HOY SÍ CIRCULAS]  |        18°C         |      65       |
|    Placas: 1-2-3    |       Nublado       |   [MODERADO]  |
+---------------------+---------------------+---------------+
|                🎭 Eventos Culturales de Hoy               |
|  * Recorrido Histórico Candelaria (10:00 AM) - Gratis     |
|  * Taller de Expresión Artística (2:00 PM) - Gratis       |
+-----------------------------------------------------------+
|                   🗺️ Mapa Interactivo                     |
|           [Ver Red de Ciclorutas y Bibliotecas]           |
+-----------------------------------------------------------+
```

### 3.1 Módulo de Pico y Placa (Normativa 2026)
Este módulo te indica instantáneamente si puedes circular con tu vehículo particular según el último dígito de tu placa.

*   **Indicador Visual Rápido:**
    *   🟢 **HOY SÍ PUEDES CIRCULAR (Fondo Verde):** Indica que tu placa no tiene restricción para el día en curso.
    *   🔴 **HOY NO PUEDES CIRCULAR (Fondo Rojo):** Indica que tu placa está restringida en el horario de Pico y Placa.
*   **Dígitos Restringidos:** Muestra claramente qué números de placa tienen prohibición de circular ese día.
*   **Horario de Restricción:** Recordatorio visual del horario corrido vigente en Bogotá: **Lunes a Viernes de 6:00 AM a 9:00 PM**.
*   **Consulta Rápida:** En la parte inferior del widget, puedes digitar tu número de placa para verificar su estado de manera personalizada para el día de hoy y el día de mañana.
*   *Nota:* Recuerda que los fines de semana y días festivos no aplica la restricción. Las motocicletas y vehículos eléctricos están exentos por defecto.

### 3.2 Módulo de Clima
Muestra el estado meteorológico actual de la ciudad de Bogotá para evitar sorpresas con las lluvias de la tarde.

*   **Temperatura y Condición:** Indica la temperatura en grados Celsius y el estado del cielo (Soleado, Nublado, Lluvia ligera, etc.).
*   **Detalles Climatológicos:** Muestra la probabilidad de lluvia (%) y la humedad relativa del ambiente.
*   **Pronóstico de 5 Días:** Al hacer clic en **[Ver más]**, la tarjeta se expande en un panel modal con el pronóstico del clima por horas y para los siguientes 5 días de la semana, ideal para planificar tus viajes o paseos de fin de semana.

### 3.3 Módulo de Calidad del Aire (AQI)
Monitorea en tiempo real los contaminantes del aire para proteger tu salud y planificar actividades físicas.

*   **Valor Numérico (ICA):** Clasifica la calidad del aire según la escala internacional del Índice de Calidad del Aire.
*   **Semáforo de Salud (Colores):**
    *   🟢 **Bueno (0 - 50):** Calidad de aire óptima. Puedes hacer actividades al aire libre sin riesgo.
    *   🟡 **Moderado (51 - 100):** Aceptable. Personas sumamente sensibles a la contaminación deben considerar reducir esfuerzos prolongados al aire libre.
    *   🟠 **Dañino para grupos sensibles (101 - 150):** Niños, adultos mayores y personas con enfermedades respiratorias deben limitar esfuerzos físicos prolongados al aire libre.
    *   🔴 **Dañino (151 - 200):** Se recomienda a toda la población limitar el ejercicio al aire libre.
*   **Recomendación Activa:** El widget genera un consejo automático adaptado al nivel de contaminación detectado en la última hora.

### 3.4 Módulo de Eventos Culturales
Muestra una agenda cultural curada con actividades gratuitas o de bajo costo organizadas por las entidades del distrito de Bogotá (IDARTES, BibloRed, SCRD).

*   **Lista de Eventos:** Presenta hasta 3 eventos culturales destacados del día.
*   **Fichas Detalladas:** Cada evento cuenta con su título, lugar exacto, hora de inicio y un badge informativo indicando si es **Gratis** o el costo estimado de entrada.
*   **Detalle Expandible:** Haz clic sobre cualquier evento para leer la descripción completa de la actividad y acceder al enlace oficial de registro o detalles.

---

## 4. Manual del Mapa Interactivo (Página `/mapa`)
Para acceder a la vista completa, haz clic en **"Abrir Mapa Completo"** en el dashboard principal o dirígete a la pestaña del Mapa en la barra de navegación superior.

```
+-----------------------------------------------------------+
| [Filtros]  |                    MAPA                      |
|            |                                              |
| [x] Ciclo  |                 (O) Parque                   |
| [x] Biblio |        (O) Biblioteca                        |
| [ ] Parq   |                                              |
| [x] Museos |        ====== Red de Cicloruta ======        |
|            |                                              |
+------------+----------------------------------------------+
```

### 4.1 Navegación en el Mapa
*   **Zoom:** Usa los botones `+` y `-` en la esquina superior izquierda, o pellizca la pantalla en tu smartphone para acercar o alejar la vista.
*   **Desplazamiento:** Arrastra el mapa con un dedo en móviles o con el mouse en computadora para moverte por las diferentes localidades de Bogotá.

### 4.2 Panel de Filtros Lateral
En el panel lateral izquierdo, puedes encender o apagar capas de información geográfica según tus necesidades de transporte y recreación:
1.  **Red de Ciclorutas (Línea Verde):** Dibuja en el mapa el trazado de la red de ciclorutas de Bogotá (más de 390 km habilitados) para que planifiques rutas seguras en bicicleta.
2.  **Parques (Icono Árbol 🌳):** Muestra la ubicación de los principales parques metropolitanos y zonales (ej. Parque Simón Bolívar, Parque El Virrey, Parque Nacional).
3.  **Bibliotecas (Icono Libros 📚):** Ubica las sedes de la Red Distrital de Bibliotecas Públicas (BibloRed) con sus respectivas direcciones.
4.  **Centros Culturales (Icono Máscaras 🎭):** Muestra teatros, salas de conciertos y centros culturales administrados por el distrito.

### 4.3 Fichas de Información en Mapa (Popups)
Al hacer clic sobre cualquiera de los iconos del mapa, se desplegará una ventana emergente que incluye:
*   Nombre oficial de la entidad o parque.
*   Dirección de acceso.
*   Horarios de atención o estado del punto de interés.
*   Un botón para trazar ruta o ver más información en portales oficiales.

---

## 5. Rutina de Uso Diario (Ahorra hasta 10 Minutos)
Para maximizar el provecho de CivicView en tu día a día, te sugerimos seguir estos sencillos pasos cada mañana:
1.  **Abre la App al Despertar:** Mantén CivicView en tus marcadores del navegador o en la pantalla de inicio de tu celular. Abre la app antes de prepararte.
2.  **Chequea Pico y Placa (1 segundo):** Mira el color de fondo del widget de Pico y Placa. Si es verde, puedes usar tu carro particular. Si es rojo, planifica tu viaje en transporte público o bicicleta.
3.  **Verifica Clima y Aire (3 segundos):** Revisa la temperatura y la probabilidad de lluvia. Si la probabilidad es mayor a 50%, no olvides tu sombrilla o impermeable. Revisa el ICA si sufres de alergias o asma para saber si es seguro salir a trotar.
4.  **Busca una Cicloruta o Parque (6 segundos):** Si decidiste viajar en bicicleta, abre el mapa, activa la capa de ciclorutas y ubica la ruta óptima para llegar de manera segura a tu destino.
