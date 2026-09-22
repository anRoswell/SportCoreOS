# ⚽ SportCoreOS Backend API (NestJS + PostgreSQL)

API RESTful empresarial y multi-tenant de alto rendimiento para la gestión deportiva, médica, analítica (IA), logística y financiera de escuelas y academias de fútbol formativo.

---

## 🚀 Puesta en Marcha

```bash
cd SportCoreOS-api
npm install
npm run start:dev
```

- **Servidor API:** `http://localhost:3001/api/v1`
- **Swagger OpenAPI Docs:** `http://localhost:3001/api/docs`
- **Archivos Estáticos Servidos:** `http://localhost:3001/uploads/...`

---

## 🏛️ Arquitectura & Principios de Ingeniería

- **Clean Architecture & SOLID:** Separación estricta de responsabilidades en 3 capas (`Controllers` &rarr; `Services` &rarr; `Repositories`).
- **BaseRepository Pattern & ACID Transactions:** Persistencia desacoplada con soporte de transacciones seguras (`withTransaction`).
- **Aislamiento Multi-Tenant Estricto:** `TenantGuard` y `TenantMiddleware` aíslan los datos por `club_id` en todas las consultas.
- **Tipado Fuerte & Cero Datos Quemados:** Todos los dominios utilizan enumeraciones centralizadas (`domain.enums.ts`) validadas con `class-validator` y `class-transformer`.
- **Almacenamiento Centralizado:** Servicio `StorageService` con firma criptográfica **SHA-256**, prevención de *Path Traversal* y metadatos persistidos en `core.archivos_adjuntos`.

---

## 📦 Módulos Implementados

1. **`AuthModule`**: Autenticación JWT, contraseñas `bcrypt`, perfiles y roles de usuario (`SUPER_ADMIN`, `DIRECTOR_DEPORTIVO`, `ENTRENADOR_DT`, `PADRE_ACUDIENTE`, `ADMIN_FINANCIERO`).
2. **`ClubesModule`**: Onboarding multi-tenant de academias, sedes, canchas e información institucional.
3. **`CategoriasModule`**: Gestión de categorías deportivas (Sub-7 a Sub-20), asignación de entrenadores y planteles.
4. **`JugadoresModule`**: Ficha 360°, expedientes médicos, acudientes, radar físico y validación de dorsal único.
5. **`BiometriaModule`**: Evaluaciones antropométricas, IMC automático, test de Cooper, velocidad 30m y salto vertical.
6. **`PartidosModule`**: Fixture, geolocalización de sedes, actas digitales en vivo (goles, tarjetas, cambios) y autoconvocatoria.
7. **`ConvocatoriasModule`**: Citaciones oficiales a partidos con confirmación de asistencia por parte de acudientes.
8. **`FinanzasModule`**: Matriz de cargos mensuales, generación masiva de cobros, cálculo de mora y registro de recaudos.
9. **`CanchasModule`**: Alquiler de escenarios con matriz horaria dinámica, bloqueo atómico de turnos y liquidación en caja.
10. **`TiendaModule`**: Catálogo de indumentaria, variantes por talla, decremento atómico de stock y despacho de pedidos con código QR.
11. **`IaModule`**: Integración con Google Gemini para generación de boletines pedagógicos, análisis de fatiga/ACWR y asistente táctico DT.
12. **`ScoutingModule`**: Pipeline de visorías, fichas de talentos observados y rúbricas técnicas/tácticas/físicas 1-10.
13. **`TelemetriaModule`**: Ingesta de archivos GPX, tracking GPS a 10Hz, Player Load y mapas de calor 2D (Heatmaps).
14. **`StorageModule`**: Gestor de subida de archivos (PNG, PDF, GPX) con validación de MIME, hash SHA-256 y descarga estática servida.
15. **`ParametrosModule` & `RolesModule`**: Motor dinámico de configuración del sistema y matriz de permisos por rol.
16. **`DashboardModule`**: KPIs ejecutivos, financieros y deportivos agregados en tiempo real.

---

## 🧪 Pruebas de Integración (Anti-Regression)

```bash
npm test -- src/modules-backend.spec.ts
```
- **42 tests de integración pasando (100% de éxito)** contra PostgreSQL real.
