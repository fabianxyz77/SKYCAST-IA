# 🌦️ SkyCast-IA - Plan de Vuelo

## 🛠️ Fase 1: Infraestructura (COMPLETO)
- [x] Configurar entorno Next.js (Lenovo + Juana Manso).
- [x] Conectar monitores con Barrier (Mouse & Teclado compartido).
- [x] Obtener API Key de OpenWeatherMap.
- [x] Configurar variables de entorno (`.env.local`).
- [x] Crear estructura de carpetas (`lib`, `hooks`, `components`).

## 🎨 Fase 2: Frontend & Ubicación (EN PROCESO)
- [x] Crear el "Mensajero" del clima (`weather.ts`).
- [x] Crear el "Hook" de ubicación (`useLocation.ts`).
- [x] Implementar permiso de Geolocalización en la UI.
- [x] Crear componente de Búsqueda de Ciudades (Manual).
- [x] Diseñar la Tarjeta de Clima Dinámica (que use datos reales).

## 🧠 Fase 3: Inteligencia Artificial (PRÓXIMAMENTE)
- [x] Configurar Google Gemini API.
- [x] Crear el "Analista Climático" (IA que da consejos según el clima).
- [x] Chat interactivo para preguntar "¿Qué me pongo hoy?".

## 📊 Fase 4: Datos & Backend (FINAL)
- [ ] Configurar Base de Datos (SQLite/PostgreSQL) para historial.
- [ ] Integrar mapa interactivo (Leaflet/Mapbox).




## Comandos Push de Github:

1. Ver qué cambió
## git status
¿Para qué sirve? Te muestra una lista de todos los archivos que modificaste, borraste o creaste (aparecerán en rojo). Es como hacer un inventario antes de cerrar una caja.

2. Preparar los archivos
## git add .
¿Para qué sirve? El punto . significa "todo". Este comando mete todos los cambios del inventario dentro de la "caja" de envío. Los archivos ahora pasarán de rojo a verde.

3. Ponerle una etiqueta (El Mensaje)
## git commit -m "Refactorización: componentes separados y mejora de GPS"
¿Para qué sirve? Es el sello de la caja. El mensaje entre comillas debe ser descriptivo para que, si el día de mañana algo falla, sepas exactamente qué hiciste en este paso.

4. Lanzar a la nube
## it push origin main
¿Para qué sirve? Este es el comando final. Sube tu "caja" sellada desde tu computadora a los servidores de GitHub.