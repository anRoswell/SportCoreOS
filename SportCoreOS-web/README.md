# ⚽ FutCoreOS Frontend Web App (Angular 19 + Signals)

Interfaz web moderna y reactiva diseñada con arquitectura Mobile-First, estética limpia y clara por defecto (**Clean Pro Sport**) y selector instantáneo con persistencia para alternar a **Dark Sport Mode** según la preferencia del usuario.

## 🚀 Puesta en Marcha

```bash
cd FutCoreOS-web
npm install
npm start
```

- **Puerto por defecto:** `http://localhost:4202`

## 🎨 Sistema de Diseño y Temas (Light / Dark Switcher)
- **Tema Claro (Por defecto):** Estética limpia con fondos blancos y slate suave (`#F8FAFC`, `#FFFFFF`), contraste nítido, detalles deportivos verde esmeralda (`#10B981`) y azul cobalto.
- **Tema Oscuro (Dark Sport):** Fondo deep navy/slate (`#0B0F19`, `#111827`) con acentos brillantes para ambientes de baja luminosidad o gusto deportivo nocturno.
- **Selector Instantáneo:** Botón en el Navbar con persistencia en `localStorage` y reactividad basada en Angular Signals.

## 🌟 Vistas y Módulos Implementados
1. **Dashboard & KPIs:** Métricas de jugadores activos, recaudo de pensiones PSE, distribución táctica por posiciones y calendario de partidos.
2. **Jugadores & Fichas:** Directorio con filtros por categoría (Sub-7 a Sub-20), dorsales, control antropométrico y estado de matrícula.
3. **Categorías Deportivas:** Configuración de rangos de edad, cuerpo técnico y cupos de plantel.
4. **Partidos & Fixture:** Programación de partidos de liga/amistosos, condición local/visitante y mapa GPS de llegada.
5. **Convocatorias Oficiales:** Citación interactiva de nómina titular y banco de suplentes con confirmación en tiempo real.
6. **Biometría & Tests Físicos:** Registro antropométrico (peso, talla, IMC) y test de Cooper / velocidad / salto vertical.
7. **Finanzas & Cobros PSE:** Generación de cargos, pasarela Wompi / PSE, estados de cuenta y control de cartera morosa.
8. **Portal Móvil Padres:** Web app para acudientes: confirmación de partido en 1 clic, pago de mensualidad PSE y boletín de rendimiento deportivo.
