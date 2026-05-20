# 📢 Preparación de Material Promocional — CivicView

Dado que **CivicView** es un proyecto enfocado en la utilidad comunitaria de Bogotá y representa la etapa productiva del tecnólogo SENA del desarrollador Jeyson Andrés Ortiz Mendoza, la estrategia promocional debe ser dual:
1.  **Académica/Profesional:** Para visibilizar las competencias de desarrollo de software full-stack en plataformas de empleo y redes profesionales (ej. LinkedIn).
2.  **Cívica/Comunitaria:** Para atraer usuarios reales y lograr las metas del piloto, enfocándose en la Localidad de Kennedy y el sector de El Tintal.

---

## 1. Propuesta de Valor y Elevator Pitch

### 1.1 Propuesta de Valor
> *"CivicView condensa los datos críticos de movilidad, clima y medio ambiente de Bogotá en un dashboard Neo-Táctil ultrarrápido, permitiendo al ciudadano tomar decisiones informadas en 10 segundos antes de salir de casa, sin publicidad molesta ni navegación compleja."*

### 1.2 Elevator Pitch (Discurso de Elevador - 30 Segundos)
*"¿Sabías que un bogotano promedio pierde hasta 15 minutos diarios abriendo diferentes aplicaciones del distrito para saber si tiene Pico y Placa, si va a llover o cómo está la calidad del aire? He desarrollado **CivicView**, una plataforma web progresiva que centraliza estos datos en tiempo real mediante un proxy de APIs resiliente y un sistema de caché de alta velocidad. Con CivicView, los ciudadanos planifican su transporte y cuidan su salud en menos de 10 segundos, ahorrando más de 5 horas al mes. El proyecto ya está desplegado en la nube y listo para expandirse a otras ciudades."*

---

## 2. Plantillas de Contenido para Redes Sociales

### 2.1 Publicación para LinkedIn (Enfoque Profesional / Portafolio)
*   **Público:** Reclutadores, ingenieros de software, instructores SENA y la red profesional de Jeyson.
*   **Tono:** Profesional, técnico y de logro académico.

---

**Título: ¡Proyecto Finalizado! Presento CivicView: Dashboard Cívico para Bogotá 🏙️🚗**

¡Hola a todos! Es un gusto compartirles el cierre y puesta en marcha de **CivicView**, mi proyecto de Etapa Productiva para optar por el título de *Tecnólogo en Análisis y Desarrollo de Software* en el **SENA - Centro Agroempresarial y Desarrollo Pecuario del Huila (Garzón)**.

CivicView es una aplicación web progresiva (PWA) diseñada para consolidar información crítica de Bogotá D.C. en tiempo real (Pico y Placa 2026, clima, índice de calidad del aire y agenda cultural), ayudando a los ciudadanos a planificar su día a día de manera eficiente.

**🛠️ El Stack Tecnológico:**
*   **Frontend:** React 18 + Vite 5, consumiendo servicios unificados mediante Axios.
*   **Mapas:** Leaflet.js para renderizar la red de ciclorutas de Bogotá y puntos de interés mediante capas GeoJSON.
*   **Estilos:** CSS puro + Tailwind CSS 3 estructurado en un sistema de diseño Neo-Táctil con Dark Mode nativo.
*   **Backend:** Node.js + Express estructurado como API Gateway/Proxy para ocultar credenciales y normalizar datos.
*   **Resiliencia y Caché:** Mecanismo de caché en dos niveles (node-cache en memoria RAM para latencias <5ms y persistencia en DB) con sistema de reintentos y fallbacks ante caídas de APIs gubernamentales.
*   **Base de Datos:** MySQL ejecutado en **TiDB Cloud (Serverless)** para almacenar logs de auditoría y variables de proveedores.
*   **Despliegue:** Frontend en **Vercel** y Backend en **Render**.

El proyecto ya está en funcionamiento con datos reales. Les invito a probarlo y darme su feedback:
🚀 **Demo en vivo:** https://civicview.vercel.app
📁 **Repositorio Git:** https://github.com/andrewortiz89/civicview.git

Agradezco al SENA y a mis instructores por el acompañamiento en este proceso de formación. ¡Seguimos construyendo soluciones de software con impacto social!

#DesarrolloDeSoftware #React #NodeJS #FullStack #SENA #MySQL #CloudComputing #WebDevelopment

---

### 2.2 Publicación para Twitter/X (Enfoque de Utilidad al Ciudadano)
*   **Público:** Bogotanos en general, ciclistas, conductores y usuarios de transporte público.
*   **Tono:** Informativo, directo y ágil.

---

**Hilo:**

1/5 ¿Cansado de abrir 5 páginas distintas cada mañana en Bogotá para saber si puedes sacar el carro, si debes llevar sombrilla o si el aire está muy contaminado para salir a correr? He creado una solución gratuita: **CivicView** 🏙️👇
[Enlace a https://civicview.vercel.app]

2/5 🚗 **Pico y Placa 2026:** Escribe el último dígito de tu placa y entérate de inmediato si tienes restricción hoy y mañana bajo la norma vigente de alternancia par/impar. Rápido y sin rodeos.

3/5 💨 **Calidad del Aire y Clima:** Consulta el índice de calidad del aire (ICA) actualizado en tiempo real con recomendaciones de salud personalizadas y el pronóstico de lluvias de OpenWeatherMap.

4/5 🚴 **Mapa de Ciclorutas y Bibliotecas:** ¿Te mueves en bici? Activa el mapa interactivo para ver los 390 km de la red de ciclorutas de Bogotá, parques metropolitanos y las sedes de BibloRed más cercanas con sus direcciones.

5/5 ⚡ CivicView es una PWA ultrarrápida: puedes agregarla a la pantalla de inicio de tu celular para abrirla al instante sin consumir almacenamiento. Pruébala hoy y cuéntame cuánto tiempo te ahorras: https://civicview.vercel.app

---

### 2.3 Publicación para Facebook / Grupos Comunitarios (Barrio El Tintal / Kennedy)
*   **Público:** Vecinos de la localidad y el barrio Tintal.
*   **Tono:** Cercano, colaborativo y vecinal.

---

**Título: Vecinos de Kennedy/Tintal: Nueva herramienta gratuita para ciclistas y conductores de la zona 🚴🚗**

¡Hola vecinos! Quería compartirles un proyecto gratuito que desarrollé y que espero les sea de gran utilidad para el día a día en nuestro sector. Se llama **CivicView** y es una página web diseñada especialmente para los bogotanos.

Desde la plataforma pueden revisar en segundos:
*   Si tienen restricción de Pico y Placa hoy o mañana en el horario de 6 AM a 9 PM.
*   La red de **Ciclorutas** mapeada sobre Kennedy y el Tintal, ideal para los que nos movemos en bicicleta.
*   La ubicación y dirección de nuestras bibliotecas públicas (como la Biblioteca El Tintal) y parques de la zona.
*   El pronóstico de lluvias y el índice de contaminación del aire en tiempo real.

No requiere registrarse, no tiene publicidad molesta y carga súper rápido en cualquier celular. 

Les dejo el enlace para que lo guarden en sus favoritos:
👉 https://civicview.vercel.app

Soy estudiante de desarrollo de software y este es mi proyecto final. Si lo usan y me pueden dejar sus comentarios de mejora o reportar si les sirve, ¡se los agradecería muchísimo!

---

## 3. Conceptos para Flyers Visuales (Difusión Digital)

### Flyer 1: "Bogotá en una Sola Pantalla" (Público general / Conductores)
*   **Cabecera:** Imagen del dashboard de CivicView en un smartphone flotante con el fondo Neo-Táctil (azul oscuro y acentos cyan).
*   **Título Principal:** "CivicView: Planifica tu día en Bogotá en 10 segundos."
*   **Elementos Destacados:**
    *   Icono 🚗: "Consulta inteligente de Pico y Placa."
    *   Icono ☁️: "Pronóstico de clima y lluvias en tiempo real."
    *   Icono 💨: "Calidad de aire y alertas de salud."
*   **Llamado a la acción (CTA):** Código QR gigante con el texto: *"Escanea y añádelo a tu pantalla de inicio - Gratis y sin registro"*.

### Flyer 2: "Rueda Seguro por Bogotá" (Público: Ciclistas urbanos de Kennedy)
*   **Cabecera:** Imagen estilizada de una persona montando bicicleta por la cicloruta del Tintal con el mapa interactivo de CivicView de fondo.
*   **Título Principal:** "Tus rutas cívicas de Bogotá en tu celular."
*   **Elementos Destacados:**
    *   Icono 🚴: "Red completa de ciclorutas integrada."
    *   Icono 🌳: "Ubicación de parques públicos y zonas verdes."
    *   Icono 📚: "Sedes de BibloRed en tu camino."
*   **Frase de impacto:** *"Monitorea el clima y la calidad del aire antes de tu rodada diaria"*.
*   **Llamado a la acción (CTA):** Dirección web corta: `civicview.vercel.app`.

---

## 4. Alianzas de Difusión Local
Para maximizar el uso del piloto de forma orgánica y sin presupuesto publicitario, se implementarán las siguientes acciones:
1.  **Colectivos de Biciusuarios en Kennedy:** Compartir la herramienta en grupos de ciclismo urbano de Facebook y chats de WhatsApp de colectivos locales (ej. "Colectivo Ciclistas del Tintal").
2.  **Centros de Computo Comunales:** Solicitar a los administradores de salas de informática comunales o de bibliotecas (BibloRed El Tintal) colocar un acceso directo a CivicView en los computadores públicos como herramienta de consulta ciudadana.
