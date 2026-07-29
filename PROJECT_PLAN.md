# 🎰 LottoHQ — Plan del Proyecto y Hoja de Ruta (Roadmap)

## 📌 Visión del Proyecto
LottoHQ es una plataforma de resultados de loterías de ultra alto rendimiento (tiempos de respuesta sub-50ms), diseño **Mobile-First** inspirado en ****, y arquitectura escalable **Multi-País (Fase 1: EE. UU. ➔ Fase 2: España, México, Latinoamérica)**.

---

## 🛠️ Stack Tecnológico Confirmado
- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** JavaScript (ES6+, Async/Await, Optional Chaining, Libre de TypeScript)
- **Estilos:** Tailwind CSS (Modo Oscuro Slate-950 + Alto Contraste  Style)
- **Base de Datos:** MySQL + Prisma ORM (Columnas `@db.Json` nativas para combinaciones flexibles)
- **Caché & Tiempo Real:** Upstash Redis (Cache-Aside Strategy + Fallback en Memoria)
- **SEO:** Metadata dinámica, Sitemap XML dinámico, Schema.org (JSON-LD Structured Data)

---

## 📐 Arquitectura Modular Reutilizable

```text
src/
├── app/
│   ├── api/
│   │   └── revalidate/               # API Route de Revalidación On-Demand ISR
│   ├── [country]/                    # Route dynamic multi-país (/us, /es, /mx)
│   │   ├── page.js                   # Dashboard del País — Layout unificado (max-w-6xl)
│   │   ├── estado/[stateSlug]/       # SEO por Estado (/us/estado/florida) — Layout unificado
│   │   └── [lottery]/                # Detalle de Lotería (/us/powerball) — Layout unificado
│   │       └── sorteo/[drawId]/      # Sorteo Histórico Individual (SEO Long-Tail) — Layout unificado
│   ├── sitemap.js                    # Generador Dinámico de Sitemap XML
│   ├── layout.js                     # Root Layout con Tailwind CSS
│   └── globals.css                   # Estilos Globales
│
├── components/                       # BIBLIOTECA MODULAR 100% REUTILIZABLE
│   ├── ui/                           # Componentes Atómicos & Herramientas
│   │   ├── Ball.jsx                  # Esfera 3D de Número / Bola Especial
│   │   ├── Badge.jsx                 # Etiquetas de Multiplicador / Jackpot
│   │   ├── QuickPicks.jsx            # Generador interactivo de jugadas rápidas
│   │   └── FaqAccordion.jsx          # Acordeón de FAQs optimizado para SEO
│   ├── lottery/                      # Componentes de Dominio de Lotería
│   │   ├── WinningCombination.jsx    # Renderizador universal de combinaciones
│   │   ├── LotteryCard.jsx           # Tarjeta genérica estilo 
│   │   ├── PrizeTable.jsx            # Tabla responsive de desglose de premios
│   │   ├── JackpotHero.jsx           # Banner de botes acumulados
│   │   └── StateGrid.jsx             # Reutilizable para loterías por estado
│   └── layout/                       # Estructura Global de Maquetación
│       ├── Header.jsx                # Header con ticker en vivo y selector A-Z
│       ├── Sidebar.jsx               # Menú lateral descolgable responsivo
│       ├── Footer.jsx                # Pie de página legal y SEO
│       └── MobileNav.jsx             # Barra de navegación flotante móvil
│
├── lib/                              # INFRAESTRUCTURA DE SERVICIOS
│   ├── prisma.js                     # Instancia Singleton de Prisma Client
│   ├── redis.js                      # Cliente de Caché con Fallback
│   ├── formatters.js                 # Formateadores de Moneda ($360M) y Fechas
│   └── seo.js                        # Generador de JSON-LD Schema Markup
│
└── services/
    └── lotteryService.js             # Capa de Servicio Genérica (BD + Redis Cache <50ms)
```

---

## 📈 ESTADO Y AVANCE DEL PROYECTO

### ✅ FASE 1: Arquitectura Base & Sistema Modular (COMPLETADO)
- [x] **Diseño de Rutas Dinámicas Multi-País:** Estructura `/[country]/[lottery]` y `/[country]/estado/[stateSlug]`.
- [x] **Modelo de Datos Prisma MySQL (`schema.prisma`):** Tablas `Country`, `Lottery`, `Draw`, `PrizeBreakdown` con JSON nativo `@db.Json` para combinaciones dinámicas.
- [x] **Capa de Caché de Alta Velocidad (Redis + Fallback):** Implementada en `src/lib/redis.js` y `src/services/lotteryService.js` (Sub-50ms).
- [x] **Sistema de Estilos Inspirado en :** Esferas 3D de alto contraste.

---

### ✅ FASE 2: Biblioteca de Componentes Reutilizables (COMPLETADO)
- [x] **Header Component:** Con ticker de sorteos en vivo y switchers regionales.
- [x] **Sidebar Component:** Menú lateral responsivo colapsable con accesos rápidos por estado.
- [x] **Footer Component:** Descargos de responsabilidad legal y enlaces para SEO.
- [x] **MobileNav Component:** Navegación flotante inferior en dispositivos móviles.
- [x] **QuickPicks Component:** Generador interactivo de jugadas de la suerte aleatorias.
- [x] **FaqAccordion Component:** Acordeón de preguntas frecuentes interactivo.
- [x] **JackpotHero & StateGrid:** Módulos principales para estructurar el inicio.

---

### ✅ FASE 3: Motor de Ingesta & API Webhooks (COMPLETADO)
- [x] **API Route de Revalidación:** `/api/revalidate` para invalidar caché de Next.js (On-Demand ISR) y Redis en tiempo real.
- [x] **Sitemap XML Dinámico:** `src/app/sitemap.js` para indexación masiva en Google Search Console.

---

### ✅ FASE 4: Estandarización de Rutas & Layout Unificado (COMPLETADO)
- [x] **Eliminación de ruta estática duplicada:** Eliminado `src/app/us/page.js` y carpeta `us/`. La ruta `/us` ahora es servida exclusivamente por `[country]/page.js` (sistema modular correcto).
- [x] **Layout global en página de Estado:** `[country]/estado/[stateSlug]/page.js` migrado del header inline al uso de `<Header>`, `<Footer>` y `<MobileNav>`. Incluye breadcrumb consistente con el resto de páginas.
- [x] **Ancho de contenido `max-w-6xl` unificado:** Todas las páginas (`[country]`, `[lottery]`, `estado/[stateSlug]`, `sorteo/[drawId]`) usan `max-w-6xl` como ancho máximo de contenido (antes: mezcla de `max-w-5xl` y `max-w-7xl`).
- [x] **Padding responsivo uniforme:** Todas las páginas aplican `pb-16 md:pb-0` en el wrapper raíz para compensar la MobileNav flotante en móvil.
- [x] **Arquitectura de layout 100% homogénea:**
  ```
  /us              → [country]/page.js    ✅ Header + Footer + MobileNav + max-w-6xl
  /us/powerball    → [country]/[lottery]  ✅ Header + Footer + MobileNav + max-w-6xl
  /us/estado/...   → [country]/estado/... ✅ Header + Footer + MobileNav + max-w-6xl
  /us/pb/sorteo/.. → sorteo/[drawId]      ✅ Header + Footer + MobileNav + max-w-6xl
  ```

---

*Última actualización: 2026-07-27 — Desarrollado por el equipo Lead Full-Stack Architect.*
