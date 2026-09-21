# ⚽ FutCoreOS Backend API (NestJS + PostgreSQL)

API RESTful empresarial y multi-tenant para la gestión deportiva, administrativa y financiera de academias de fútbol formativo.

## 🚀 Puesta en Marcha Rápida

```bash
cd FutCoreOS-api
npm install
npm run start:dev
```

- **Puerto por defecto:** `http://localhost:3001`
- **Swagger OpenAPI Docs:** `http://localhost:3001/api/docs`

## 🛡️ Módulos Implementados
- `AuthModule`: Login con JWT y encriptación bcrypt, control de roles deportivos.
- `ClubesModule`: Gestión multi-tenant de clubes, sedes y canchas.
- `CategoriasModule`: Categorías Sub-7 a Sub-20, planteles y asignación de DT.
- `JugadoresModule`: Expediente 360°, datos familiares, historial médico y deportivo.
- `BiometriaModule`: Antropometría, índice IMC, tests de Cooper, velocidad y salto.
- `PartidosModule`: Fixture, estadios/canchas con GPS, actas de juego y estadísticas.
- `ConvocatoriasModule`: Citaciones a partidos con confirmación interactiva de padres.
- `FinanzasModule`: Cobro recurrente PSE/Wompi, control de cartera y estado de cuenta.
- `DashboardModule`: KPIs deportivos y ejecutivos en tiempo real.
