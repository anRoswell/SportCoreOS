# ⚽ SportCoreOS — Manual de Identidad Visual & Paleta de Colores

Bienvenido a la guía oficial de marca, diseño de interfaz y sistema de diseño visual de **SportCoreOS** (Plataforma Integral de Alto Rendimiento para Academias & Clubes Deportivos).

---

## 1. Emblema & Logo Oficial

El isotipo y logotipo de **SportCoreOS** fusiona cuatro pilares conceptuales del deporte contemporáneo y la analítica digital:
1. **La Esfera Poligonal (Red & Balón):** Estructura geodésica inspirada en el balón de fútbol tradicional combinada con una topología de nodos de datos en red.
2. **El Atleta Cinético (Letra 'S'):** Silueta de aceleración atlética que simultáneamente dibuja la letra **S** de *SportCore*.
3. **El Pulso Biométrico & Telemetría:** Señal electrocardiográfica y radar de frecuencia cardíaca/GPS que atraviesa el núcleo central.
4. **La Órbita de Proyección:** Anillo elíptico en velocidad que simboliza la evolución y ascenso del deportista hacia el profesionalismo.

> **Archivos de Imagen en el Proyecto:**
> - Logo Completo con Badge: `SportCoreOS/branding/sportcore_logo.jpg` (`public/assets/branding/sportcore_logo.jpg`)
> - Isotipo / Icono App: `SportCoreOS/branding/sportcore_icon.jpg` (`public/assets/branding/sportcore_icon.jpg`)

---

## 2. Paleta Cromática Oficial

La paleta cromática de **SportCoreOS** está calibrada bajo el estándar **Dark Sport Pro** y **High-Visibility Athletics**, garantizando contraste óptimo (WCAG AAA), legibilidad en pantallas bajo luz solar y estética tecnológica de primer nivel.

### 🟢 Colores Primarios (Brand Identity)

| Muestra | Nombre Comercial | HEX | RGB | HSL | Propósito de Uso |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 🟢 | **Emerald Pitch** | `#10B981` | `rgb(16, 185, 129)` | `hsl(160, 84%, 39%)` | Color insignia principal. Botones de acción primaria, badges de estado activo, éxito y confirmación. |
| 🌲 | **Deep Emerald** | `#059669` | `rgb(5, 150, 105)` | `hsl(161, 94%, 30%)` | Estado hover de botones primarios, headers secundarios y acentos institucionales. |
| 🔷 | **Stadium Cyan** | `#06B6D4` | `rgb(6, 182, 212)` | `hsl(189, 94%, 43%)` | Módulo de telemetría GPS, analítica en tiempo real, widgets de IA táctica y copiloto. |
| 🔵 | **Electric Blue** | `#0284C7` | `rgb(2, 132, 199)` | `hsl(201, 96%, 39%)` | Fichas técnicas, enlaces informativos, roles directivos y filtros secundarios. |
| ⚡ | **Cyber Lime High-Vis** | `#22C55E` | `rgb(34, 197, 94)` | `hsl(142, 71%, 45%)` | KPIs de alto rendimiento, micro-animaciones, destellos de radar y convocatorias confirmadas. |

---

### ⚫ Colores de Superficie & Fondo (Dark Sport UI & Light Mode)

| Muestra | Nombre Comercial | HEX | RGB | HSL | Propósito de Uso |
| :---: | :--- | :---: | :---: | :---: | :--- |
| ⬛ | **Obsidian Titanium** | `#0B0F19` | `rgb(11, 15, 25)` | `hsl(223, 39%, 7%)` | Fondo base principal en modo oscuro (`body.dark-mode`), ambientación nocturna de estadio. |
| 🌑 | **Carbon Slate** | `#111827` | `rgb(17, 24, 39)` | `hsl(221, 39%, 11%)` | Fondo de sidebar, navbar elevado y paneles laterales fijos. |
| 🔳 | **Card Surface Dark** | `#1F2937` | `rgb(31, 41, 55)` | `hsl(215, 28%, 17%)` | Superficie de tarjetas deportivas (`.fut-card`), modales elevados y filas de tablas. |
| ◽ | **Border Slate** | `#374151` | `rgb(55, 65, 81)` | `hsl(217, 19%, 27%)` | Bordes sutiles, divisores de sección y wrappers de inputs. |
| ⚪ | **Stadium White** | `#F8FAFC` | `rgb(248, 250, 252)` | `hsl(210, 40%, 98%)` | Fondo principal en modo claro y color de texto blanco brillante en modo oscuro. |
| ⬜ | **Pure Light Surface** | `#FFFFFF` | `rgb(255, 255, 255)` | `hsl(0, 0%, 100%)` | Tarjetas y modales en tema claro. |

---

### 🟡 Colores de Estado & Funcionales (Feedback & Alerts)

| Muestra | Nombre Comercial | HEX | RGB | HSL | Propósito de Uso |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 🏆 | **Championship Gold** | `#F59E0B` | `rgb(245, 158, 11)` | `hsl(38, 92%, 50%)` | Categorías Élite, becas deportivas, alertas preventivas de fatiga ACWR y pagos pendientes. |
| 🔴 | **Pulse Red** | `#EF4444` | `rgb(239, 68, 68)` | `hsl(0, 84%, 60%)` | Sobreentrenamiento / riesgo lesión, mora financiera, expulsiones y bajas de jugadores. |
| 🟣 | **Electric Violet** | `#8B5CF6` | `rgb(139, 92, 246)` | `hsl(258, 90%, 66%)` | Inteligencia Artificial Gemini, generación de boletines y scouting internacional. |
| 🔘 | **Neutral Muted** | `#64748B` | `rgb(100, 116, 139)` | `hsl(215, 16%, 47%)` | Subtítulos, etiquetas secundarias, timestamps y estados inactivos. |

---

## 3. Gradientes Oficiales del Sistema (Glows & Surfaces)

```css
/* 1. Gradiente Insignia: Velocity Emerald */
--gradient-primary: linear-gradient(135deg, #10B981 0%, #06B6D4 100%);

/* 2. Gradiente Telemetría & IA: Cyber Kinetic */
--gradient-telemetry: linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #8B5CF6 100%);

/* 3. Gradiente Championship: Copa & Torneos */
--gradient-championship: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);

/* 4. Gradiente Dark Titanium (Fondo de Tarjetas Pro) */
--gradient-dark-surface: linear-gradient(180deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.98) 100%);

/* 5. Glow Acento Neón Deportivo */
--glow-emerald: 0 0 25px rgba(16, 185, 129, 0.35);
--glow-cyan: 0 0 25px rgba(6, 182, 212, 0.35);
--glow-gold: 0 0 25px rgba(245, 158, 11, 0.35);
```

---

## 4. Tipografía Recomendada

| Uso | Familia Tipográfica | Pesos | Muestra / Contexto |
| :--- | :--- | :--- | :--- |
| **Titulares & Logotipo** | `'Inter'`, `'Montserrat'`, `sans-serif` | 700 (Bold), 800 (ExtraBold), 900 (Black) | `SPORTCORE OS` / `Directorio de Jugadores 360°` |
| **Dorsales & Marcadores** | `'Chakra Petch'`, `'Rajdhani'`, `monospace` | 700 (Bold), 600 (SemiBold) | `#10`, `94% FCMax`, `3.2 km Sprint` |
| **Cuerpo de Texto & UI** | `'Inter'`, `system-ui`, `-apple-system` | 400 (Regular), 500 (Medium), 600 (SemiBold) | Tablas, formularios, fichas y descripciones |

---

## 5. Tokens CSS & Variables SCSS Listas para Usar

```scss
// ==========================================================================
// SPORTCORE OS — DESIGN TOKENS & PALETTE
// ==========================================================================

:root {
  // Brand Colors
  --sport-primary: #10b981;
  --sport-primary-hover: #059669;
  --sport-primary-light: #ecfdf5;
  --sport-secondary: #06b6d4;
  --sport-secondary-hover: #0891b2;
  --sport-accent-lime: #22c55e;
  --sport-accent-blue: #0284c7;
  --sport-accent-purple: #8b5cf6;

  // Status & Alerts
  --sport-gold: #f59e0b;
  --sport-danger: #ef4444;
  --sport-danger-hover: #dc2626;
  --sport-warning: #f59e0b;
  --sport-success: #10b981;
  --sport-info: #06b6d4;

  // Dark Mode Surfaces (Dark Sport Pro)
  --sport-bg-dark: #0b0f19;
  --sport-sidebar-dark: #111827;
  --sport-card-dark: #1f2937;
  --sport-card-dark-alt: #182234;
  --sport-border-dark: #374151;
  --sport-text-light: #f8fafc;
  --sport-text-muted: #94a3b8;

  // Light Mode Surfaces
  --sport-bg-light: #f8fafc;
  --sport-card-light: #ffffff;
  --sport-border-light: #e2e8f0;
  --sport-text-dark: #0f172a;
  --sport-text-subtle: #64748b;

  // Elevation & Shadows
  --sport-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --sport-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --sport-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --sport-shadow-glow: 0 0 20px rgba(16, 185, 129, 0.25);
  --sport-shadow-cyan-glow: 0 0 20px rgba(6, 182, 212, 0.25);

  // Border Radii
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
}
```

---

## 6. Reglas de Composición Visual (Ratio 60-30-10)

Para mantener una interfaz deportiva sobria, profesional y de nivel corporativo internacional:

* **60% Superficie Base:** Fondos oscuros profundos (`#0B0F19` / `#111827`) o claros limpios (`#F8FAFC`).
* **30% Estructura & Soporte:** Tarjetas con bordes sutiles (`#1F2937` / `#374151`), tablas y tipografía en escala de grises.
* **10% Acentos Dinámicos:** Destellos de color vibrante exclusivamente en CTAs primarios (`#10B981`), badges de telemetría (`#06B6D4`) y trofeos/alertas (`#F59E0B`).
