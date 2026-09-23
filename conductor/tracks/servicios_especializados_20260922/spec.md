# Specification: Módulo de Servicios Especializados & Masterclasses Pro

## Overview
El módulo de **Servicios Especializados & Masterclasses Pro** permite a las escuelas y clubes deportivos afiliados a **SportCoreOS** estructurar, publicar y monetizar programas de entrenamiento intensivo de micro-habilidades (Explosividad, Neuro-Agilidad Fitlight, Regate 1v1, Guante de Oro, Definición) fuera de los horarios habituales, con gestión de cupos limitados, sedes geolocalizadas en Cartagena, pasarela de pagos instantánea (PSE / Wompi / Nequi), descuento de hermanos (-15%), generación de Pases QR Digitales y vinculación con la Ficha 360° del jugador.

## Functional Requirements
1. **Catálogo y Administración de Clínicas (Escuela / DT):**
   - Creación y edición de clínicas especializadas con título, subtítulo, categoría, entrenador asignado, sede de Cartagena con enlace GPS, horarios, edades, cupos totales e insignia desbloqueada.
   - Cálculo y visualización de KPIs de ocupación y recaudo en tiempo real.
   - Consulta de listado de alumnos inscritos con datos de acudiente y código de pase digital.
2. **Exploración y Checkout Familiar (Web & Mobile):**
   - Exploración visual con chips de categorías, tarjetas con barra de urgencia de cupos y detalles del entrenador.
   - Modal interactivo de inscripción con selector de plan (Sesión Individual vs Paquete Mensual).
   - Aplicación automática de descuento por segundo hermano (-15%).
   - Selección de método de pago (Wompi PSE, Nequi, DaviPlata, Tarjeta).
3. **Pase QR Digital & Compartir por WhatsApp:**
   - Generación instantánea de ticket digital con código alfanumérico y QR Pass tras confirmación de pago.
   - Botón directo para compartir el pase y los detalles del entrenamiento vía WhatsApp Web / Móvil.
   - Bóveda "Mis Pases QR" en la app móvil del portal de padres.
4. **Gamificación & Ficha 360°:**
   - Desbloqueo de insignias de micro-habilidades (*Rayo de Aceleración*, *Visión Periférica 360°*, *Maestro del Desborde*, etc.) en el expediente del futbolista al graduarse.
5. **Gating Multi-Tenant SaaS:**
   - Activación modular bajo demanda en `/modulos-escuela` mediante el código `SERVICIOS_ESPECIALIZADOS`.

## Non-Functional Requirements & Testing Standard
- **Error Sniffer Estricto:** 0 errores de consola (`console.error`), 0 excepciones JS (`pageerror`) y 0 respuestas HTTP `>= 400` inesperadas.
- **Persistencia en PostgreSQL:** Verificación directa en base de datos sobre las tablas `servicios_especializados` e `inscripciones_servicios`.
- **Reactividad con Signals:** Tipado estricto en TypeScript sin lecturas nulas ni funciones vacías.
