# 🎓 Guía de Capacitación a Usuarios Iniciales — CivicView

Esta guía proporciona el material de entrenamiento estructurado para capacitar a los ciudadanos en el uso rápido de **CivicView**. Está diseñada para servir tanto de auto-aprendizaje como de guion de capacitación grupal (ej. talleres comunitarios en el barrio El Tintal o sesiones informativas en el SENA).

---

## 1. Plan de Capacitación Rápida (Onboarding)
El objetivo es lograr que un usuario nuevo comprenda la utilidad del sistema y sepa cómo operar cada widget en menos de **3 minutos**.

### 1.1 Estructura del Taller (Sesión de 15 Minutos)
*   **Minutos 1-3:** Introducción y Demostración. Presentación del problema de la información dispersa y cómo CivicView la unifica en un solo dashboard.
*   **Minutos 4-7:** Práctica Guiada en Smartphones. Cada usuario accede a [https://civicview.vercel.app](https://civicview.vercel.app), añade el sitio a marcadores o pantalla de inicio, y realiza su primera consulta.
*   **Minutos 8-12:** Simulación de Casos de Uso Diarios (ver Sección 2).
*   **Minutos 13-15:** Preguntas y Respuestas (FAQs).

---

## 2. Casos de Uso y Simulaciones Prácticas

Guiar a los usuarios a través de estas tres situaciones reales les ayudará a familiarizarse con la interfaz:

### Caso 1: El Conductor Organizado (Planificación de Movilidad)
*   **Objetivo:** Verificar si un automóvil con placa terminada en **7** puede transitar hoy y mañana.
*   **Pasos a seguir por el usuario:**
    1.  Abrir CivicView en el celular.
    2.  Observar el color del widget de **Pico y Placa**.
    3.  En la caja de texto inferior del widget, escribir el número `7` y presionar el botón de consulta.
    4.  El sistema responderá indicando si tiene restricción hoy y mostrará el estado proyectado para mañana (calculando de forma automática si la fecha es par o impar).
*   **Resultado esperado:** El usuario sabe si debe usar transporte público o si puede usar su vehículo particular.

### Caso 2: El Ciclista Urbano Saludable (Deporte y Transporte)
*   **Objetivo:** Verificar el estado del aire antes de salir a rodar en bicicleta y trazar la ruta sobre ciclorutas seguras.
*   **Pasos a seguir por el usuario:**
    1.  Revisar el widget de **Calidad del Aire**. Si muestra color verde (Bueno) o amarillo (Moderado), es seguro realizar actividad física.
    2.  Hacer clic en el menú superior y seleccionar **"Mapa"** (o presionar el botón "Abrir Mapa Completo" en el dashboard).
    3.  En el panel lateral de filtros del mapa, marcar las opciones: **"Ciclorutas"** y **"Bibliotecas"**.
    4.  Visualizar en el mapa la línea verde que representa la cicloruta y buscar la biblioteca pública más cercana (ej. Biblioteca Manuel Zapata Olivella - El Tintal) para planificar un punto de descanso y lectura.
*   **Resultado esperado:** El ciclista evita zonas congestionadas, transita por carriles exclusivos y cuida su salud pulmonar.

### Caso 3: Búsqueda de Ocio de Fin de Semana (Cultura)
*   **Objetivo:** Encontrar una actividad gratuita para asistir con amigos o familia en la tarde.
*   **Pasos a seguir por el usuario:**
    1.  Ir a la sección de **"Eventos Culturales de Hoy"** en el dashboard principal.
    2.  Verificar los títulos de la lista. Identificar aquellos que tengan el badge color morado de **"Gratis"**.
    3.  Hacer clic sobre el evento seleccionado para expandir la ventana modal.
    4.  Leer el equipamiento o dirección donde se realizará y la descripción del evento.
    5.  Hacer clic en el enlace adjunto para ver la fuente oficial o agendarse.
*   **Resultado esperado:** Acceso rápido y directo a la oferta cultural distrital sin registrarse en plataformas comerciales complejas.

---

## 3. Preguntas Frecuentes (FAQs)

### P1: ¿Por qué la aplicación me dice que puedo circular pero mi carro tiene restricción por ser híbrido o especial?
**R:** CivicView calcula automáticamente la norma de Pico y Placa para **vehículos particulares estándar**. Por el momento, el sistema no calcula restricciones específicas para taxis, vehículos de carga, transporte escolar ni las exenciones especiales (como el Pico y Placa Solidario o vehículos híbridos/eléctricos registrados ante la SDM). Estas exenciones deben validarse directamente en el portal de la Secretaría de Movilidad.

### P2: ¿Por qué el widget del Clima a veces dice "Lluvia" pero en mi ubicación exacta está haciendo sol?
**R:** La información de clima proviene de **OpenWeatherMap**, que consolida datos de las estaciones meteorológicas principales de la ciudad (aeropuerto, estaciones de monitoreo distrital). Al ser Bogotá una ciudad geográficamente diversa con microclimas marcados, pueden presentarse variaciones locales rápidas. El clima mostrado representa el promedio de la zona urbana de Bogotá.

### P3: ¿Qué significa cuando una tarjeta muestra una advertencia de "Datos en Caché" o "Modo Resiliente"?
**R:** Significa que el servidor de CivicView detectó que el proveedor de información externo (ej. la red Socrata del distrito o AQICN) está caído o lento. En lugar de mostrar un error de pantalla en blanco, CivicView activa su sistema de **resiliencia**, sirviendo el último dato correcto guardado en su base de datos. Puedes seguir navegando con normalidad, teniendo en cuenta que la hora de actualización del dato puede diferir de la hora actual.

### P4: ¿El mapa consume mis datos móviles de forma excesiva?
**R:** No. Las imágenes y mapas base provienen de OpenStreetMap y están optimizados para web móvil. Además, las capas específicas (Ciclorutas, Parques, Bibliotecas) se cargan como datos geográficos vectoriales ligeros (GeoJSON) y se almacenan en el caché local de tu dispositivo por 7 días. Esto reduce la descarga repetida de datos cada vez que abres el mapa.

### P5: ¿Cómo puedo instalar la aplicación en mi teléfono Android o iPhone?
*   **En Android (Chrome):** Abre la página, presiona el icono de tres puntos en la esquina superior derecha y selecciona *"Instalar aplicación"* o *"Añadir a pantalla de inicio"*.
*   **En iOS / iPhone (Safari):** Abre la página en Safari, presiona el botón *"Compartir"* (icono de cuadrado con una flecha hacia arriba) en la barra inferior y selecciona *"Añadir a la pantalla de inicio"*.
