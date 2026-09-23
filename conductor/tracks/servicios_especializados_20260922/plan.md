# Implementation Plan: Módulo de Servicios Especializados & Masterclasses Pro

## Phase 1: Arquitectura de Datos & Backend API [checkpoint: done]
- [x] Task: Diseñar tablas relacionales `servicios_especializados` e `inscripciones_servicios` con llaves foráneas a clubes y canchas en PostgreSQL
- [x] Task: Crear seed inicial de 5 clínicas élite geolocalizadas en Cartagena (Comfenalco, Alameda, Crespito, San Fernando, Bocagrande)
- [x] Task: Implementar módulo NestJS en `SportCoreOS-api` (DTOs validados, Repository, Service, Controller con JWT)
- [x] Task: Registrar `SERVICIOS_ESPECIALIZADOS` en `SPORTCORE_MODULE_CATALOG` para soporte SaaS Multi-Tenant
- [x] Task: Phase Verification & Checkpoint (Compilación exitosa y endpoints verificados)

## Phase 2: Frontend Web & Mobile con Angular Signals [checkpoint: done]
- [x] Task: Diseñar pantalla web `/servicios` en `SportCoreOS-web` con 4 KPIs en tiempo real, chips de categorías y barras de urgencia
- [x] Task: Construir modal de checkout interactivo con selector de plan, descuento de 2do hermano (-15%) y pasarela PSE/Wompi
- [x] Task: Implementar ticket digital con Código QR oficial y acción para compartir por WhatsApp
- [x] Task: Desarrollar pantalla móvil `servicios-mobile.component.ts` con drawer táctil de pago y bóveda de Pases QR
- [x] Task: Integrar navegación en sidebar web y home móvil
- [x] Task: Phase Verification & Checkpoint (Renderizado en vivo en navegador verificado con Chrome DevTools)

## Phase 3: Certificación E2E Anti-Regresión Exhaustiva [checkpoint: done]
- [x] Task: Crear suite de pruebas Playwright `e2e/modulo11-servicios-especializados.spec.ts` con `attachStrictErrorSniffer`
- [x] Task: Validar ciclo de vida de formularios, filtros y los 3 modales de la vista
- [x] Task: Comprobar inserción real y persistencia en PostgreSQL (`public.inscripciones_servicios`)
- [x] Task: Phase Verification & Checkpoint (4/4 tests aprobados al 100% con 0 errores de consola)

## Phase 4: Gamificación & Vinculación a Ficha 360° [checkpoint: pending]
- [ ] Task: Vincular graduación de clínicas con desbloqueo de insignias doradas en `public.jugadores`
- [ ] Task: Visualizar insignias obtenidas en el expediente 360° del futbolista y radar FIFA de scouting
- [ ] Task: Phase Verification & Checkpoint

## Phase 5: Split-Payment Wompi & Dispersión Automática [checkpoint: pending]
- [ ] Task: Configurar subcuentas de dispersión bancaria para abonar 97% a la academia y 3% a SECTIC S.A.S.
- [ ] Task: Implementar Webhook de confirmación de transacciones reales Wompi / Bancolombia
- [ ] Task: Phase Verification & Checkpoint
