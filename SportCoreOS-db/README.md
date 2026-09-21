# 🗄️ FutCoreOS Database (PostgreSQL Multi-Tenant)

Esquema de base de datos relacional para el SaaS deportivo **FutCoreOS**.

## 🚀 Puesta en Marcha Rápida con Docker

```bash
cd FutCoreOS-db
docker-compose up -d
```

### 🔌 Credenciales de Conexión:
- **Host:** `localhost`
- **Puerto:** `5436` (mapeado para evitar colisiones con otros servicios PostgreSQL locales)
- **Usuario:** `futcore_user`
- **Contraseña:** `FutCoreDev2026*`
- **Base de Datos:** `futcore_os_dev`
- **pgAdmin Web UI:** `http://localhost:5055` (User: `admin@futcore.co`, Pass: `FutCoreAdmin2026*`)

## 📦 Estructura del Esquema
1. `clubes` & `usuarios`: Gestión Multi-tenant y autenticación RBAC.
2. `sedes` & `canchas`: Infraestructura deportiva y alquiler de canchas.
3. `categorias`: Rangos de edad (Sub-7 a Sub-20) y cuerpo técnico.
4. `jugadores` & `acudientes`: Expediente deportivo, médico y datos familiares.
5. `evaluaciones_biometricas` & `evaluaciones_tecnicas`: Antropometría y radar de habilidades.
6. `torneos`, `partidos`, `convocatorias` & `actas_partido_eventos`: Gestión de partidos y estadísticas en tiempo real.
7. `finanzas_conceptos`, `cargos_jugador` & `pagos_recaudo`: Cobranza recurrente PSE/Wompi y control de cartera.
8. `inventario_indumentaria` & `dorsales_categoria`: Tienda de uniformes y asignación única de camisetas.
