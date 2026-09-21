# 📁 Estándar de Almacenamiento y Gestión Documental - SportCoreOS

Este documento describe la arquitectura y el estándar de almacenamiento físico y persistencia relacional en base de datos para **SportCoreOS**, homologado bajo las mejores prácticas y patrones multi-tenant de **EduCoreOS** y **ConjuntOS**.

---

## 1. Arquitectura de Almacenamiento Físico en Disco

Los archivos subidos al servidor se almacenan bajo una estructura jerárquica, determinista y particionada cronológicamente que garantiza el aislamiento multi-tenant por club deportivo y evita cuellos de botella en el sistema de archivos:

```text
uploads/
└── clubes/
    └── {clubId}/                              <-- UUID del Club / Academia (Aislamiento Multi-Tenant)
        └── {web | movil}/                     <-- Canal de origen de la subida
            └── {modulo}/                      <-- Módulo funcional (jugadores, tienda, telemetria, etc.)
                └── {YYYY}/                    <-- Año de carga (ej. 2026)
                    └── {MM}/                  <-- Mes a dos dígitos (ej. 09)
                        └── {DD}/              <-- Día a dos dígitos (ej. 21)
                            └── {safe_filename}_{hash}_{timestamp}.{ext}
```

### Rutas Físicas y Ejemplos por Módulo

| Módulo | Tipo de Contenido | Ruta de Almacenamiento Físico | Ejemplo de Archivo |
|---|---|---|---|
| **00: Clubes** | Logotipos, escudos, firmas | `uploads/clubes/{clubId}/web/clubes/{YYYY}/{MM}/{DD}/` | `logo_oficial_fcfc_a8f1_179001.png` |
| **02: Jugadores** | Fotos de perfil / Ficha 360° | `uploads/clubes/{clubId}/web/jugadores/{YYYY}/{MM}/{DD}/` | `foto_perfil_mateo_gomez_b3c2_179002.webp` |
| **02: Expedientes** | Cédulas, EPS, Certificados | `uploads/clubes/{clubId}/web/documentos/{YYYY}/{MM}/{DD}/` | `certificado_medico_eps_77e9_179003.pdf` |
| **09: Tienda** | Catálogo, fotos de indumentaria | `uploads/clubes/{clubId}/web/tienda/{YYYY}/{MM}/{DD}/` | `kit_titular_2026_c11d_179004.webp` |
| **11: Scouting** | Videos de jugadas, highlights | `uploads/clubes/{clubId}/movil/scouting/{YYYY}/{MM}/{DD}/` | `video_highlight_volante_88d4_179005.mp4` |
| **12: Telemetría** | Archivos crudos de sensores GPS | `uploads/clubes/{clubId}/web/telemetria/{YYYY}/{MM}/{DD}/` | `tracking_sensor_catapult_99e1_179006.gpx` |
| **01: Finanzas** | Comprobantes de transferencia | `uploads/clubes/{clubId}/movil/finanzas/{YYYY}/{MM}/{DD}/` | `soporte_transferencia_pension_44f2_179007.pdf` |

---

## 2. Persistencia en Base de Datos PostgreSQL (`core.archivos_adjuntos`)

Todos los archivos subidos al sistema registran metadatos y relaciones polimórficas en la tabla centralizada de auditoría:

```sql
CREATE TABLE IF NOT EXISTS core.archivos_adjuntos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES core.clubes(id) ON DELETE CASCADE,
    entidad_tipo VARCHAR(50), -- 'JUGADOR', 'PROSPECTO', 'PRODUCTO', 'CLUB', 'SESION_GPS', 'PAGO', 'BOLETIN'
    entidad_id UUID,          -- UUID del registro asociado
    tipo_documento VARCHAR(50) NOT NULL DEFAULT 'GENERAL', -- 'FOTO_PERFIL', 'DOCUMENTO_IDENTIDAD', 'CERTIFICADO_MEDICO', 'SOPORTE_PAGO', 'FOTO_PRODUCTO', 'VIDEO_HIGHLIGHT', 'TRACKING_GPS_RAW'
    nombre_original VARCHAR(255) NOT NULL,
    nombre_almacenamiento VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    mime_type VARCHAR(100),
    tamano_bytes BIGINT NOT NULL DEFAULT 0,
    path_almacenamiento TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    subido_por UUID REFERENCES core.usuarios(id) ON DELETE SET NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_archivos_club ON core.archivos_adjuntos(club_id);
CREATE INDEX IF NOT EXISTS idx_archivos_entidad ON core.archivos_adjuntos(entidad_tipo, entidad_id);
CREATE INDEX IF NOT EXISTS idx_archivos_tipo ON core.archivos_adjuntos(tipo_documento);
```

---

## 3. Principios de Seguridad e Integridad (EduCoreOS Standards)

1. **Saneamiento Estricto de Nombres de Archivo**:
   - Eliminación de acentos y caracteres diacríticos (`normalize('NFD')`).
   - Sustitución de espacios y caracteres especiales por guiones bajos (`_`).
   - Agregado de hash aleatorio y timestamp para evitar colisiones de nombres.
2. **Integridad Criptográfica (SHA-256)**:
   - Se calcula el hash SHA-256 del contenido binario para desduplicación, verificación de integridad y control de no repudio.
3. **Control de Acceso y Límites**:
   - Validación estricta de tipos MIME permitidos (Imágenes, PDF, Excel, CSV, GPX, MP4).
   - Límite de carga máxima de 50 MB por archivo.
   - Acceso autenticado mediante JWT y verificación de Tenant (`clubId`).
4. **Servidor de Archivos Estáticos**:
   - Servido directamente bajo el prefijo `/uploads/...` montado en el runtime de NestJS (`main.ts`).

---

## 4. API Endpoints del Servicio Centralizado (`StorageController`)

- **`POST /api/v1/storage/upload`**: Sube un archivo único recibiendo `folder`, `entidadTipo`, `entidadId` y `tipoDocumento`.
- **`POST /api/v1/storage/upload-multiple`**: Carga de hasta 10 archivos en una sola petición.
- **`DELETE /api/v1/storage/file?path=...`**: Eliminación física del archivo en disco.
