import os
import base64
import subprocess

ROOT_DIR = "/Users/sectic/Documents/Codigos Fuentes/SportCoreOS"
OUTPUT_HTML = os.path.join(ROOT_DIR, "portafolio_sportcore_detallado.html")
OUTPUT_PDF = os.path.join(ROOT_DIR, "PORTAFOLIO_SERVICIOS_SPORTCOREOS.pdf")

def img_to_base64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("utf-8")
            ext = os.path.splitext(path)[1].lower().replace(".", "")
            if ext == "jpg":
                ext = "jpeg"
            return f"data:image/{ext};base64,{encoded}"
    return ""

logo_b64 = img_to_base64(os.path.join(ROOT_DIR, "branding/sportcore_logo.jpg"))

# High-resolution screenshots with real populated sample data
shots = {
    "dashboard": img_to_base64(os.path.join(ROOT_DIR, "assets/screenshots/01_inicio_dashboard_raw.png")),
    "asistencia": img_to_base64(os.path.join(ROOT_DIR, "assets/screenshots/02_entrenamientos_asistencia_raw.png")),
    "partidos": img_to_base64(os.path.join(ROOT_DIR, "assets/screenshots/03_partidos_calendario_raw.png")),
    "convocatorias": img_to_base64(os.path.join(ROOT_DIR, "assets/screenshots/04_convocatorias_tactica_raw.png")),
    "canchas": img_to_base64(os.path.join(ROOT_DIR, "assets/screenshots/05_canchas_alquiler_raw.png")),
    "boletin_ia": img_to_base64(os.path.join(ROOT_DIR, "assets/screenshots/06_boletin_rendimiento_ia_raw.png")),
    "carnet": img_to_base64(os.path.join(ROOT_DIR, "assets/screenshots/07_carnet_digital_jugador_raw.png")),
    "tienda": img_to_base64(os.path.join(ROOT_DIR, "assets/screenshots/08_tienda_kits_oficiales_raw.png")),
    "pagos": img_to_base64(os.path.join(ROOT_DIR, "assets/screenshots/tablet10/09_tablet10_pagos_recaudos_raw.png")),
    "carrera": img_to_base64(os.path.join(ROOT_DIR, "assets/screenshots/tablet10/11_tablet10_modo_carrera_juego_raw.png")),
}

html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>SportCoreOS — Portafolio de Servicios Corporativo con Evidencias Reales</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Chakra+Petch:wght@700&display=swap');

  @page {{
    size: A4 portrait;
    margin: 0;
  }}

  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }}

  body {{
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: #0B0F19;
    color: #F8FAFC;
    font-size: 12px;
    line-height: 1.5;
  }}

  .page {{
    width: 210mm;
    height: 297mm;
    padding: 16mm 16mm 14mm 16mm;
    position: relative;
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    background-color: #0B0F19;
  }}

  /* Ambient Glows */
  .glow-tr {{
    position: absolute;
    top: -90px;
    right: -90px;
    width: 320px;
    height: 320px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, rgba(11, 15, 25, 0) 70%);
    border-radius: 50%;
    pointer-events: none;
  }}

  .glow-bl {{
    position: absolute;
    bottom: -90px;
    left: -90px;
    width: 320px;
    height: 320px;
    background: radial-gradient(circle, rgba(6, 182, 212, 0.14) 0%, rgba(11, 15, 25, 0) 70%);
    border-radius: 50%;
    pointer-events: none;
  }}

  /* Typography */
  h1, h2, h3, h4 {{
    color: #F8FAFC;
    font-weight: 800;
    letter-spacing: -0.02em;
  }}

  .text-emerald {{ color: #10B981; }}
  .text-cyan {{ color: #06B6D4; }}
  .text-gold {{ color: #F59E0B; }}
  .text-violet {{ color: #8B5CF6; }}
  .text-muted {{ color: #94A3B8; }}

  /* Badges */
  .badge {{
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 9999px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }}

  .badge-emerald {{
    background: rgba(16, 185, 129, 0.15);
    color: #10B981;
    border: 1px solid rgba(16, 185, 129, 0.4);
  }}

  .badge-cyan {{
    background: rgba(6, 182, 212, 0.15);
    color: #06B6D4;
    border: 1px solid rgba(6, 182, 212, 0.4);
  }}

  .badge-gold {{
    background: rgba(245, 158, 11, 0.15);
    color: #F59E0B;
    border: 1px solid rgba(245, 158, 11, 0.4);
  }}

  .badge-violet {{
    background: rgba(139, 92, 246, 0.15);
    color: #8B5CF6;
    border: 1px solid rgba(139, 92, 246, 0.4);
  }}

  /* Headers & Footers */
  .page-header {{
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-bottom: 2px solid #1F2937;
    padding-bottom: 8px;
    margin-bottom: 12px;
  }}

  .page-header-title {{
    font-size: 18px;
    font-weight: 800;
    color: #F8FAFC;
  }}

  .page-header-sub {{
    font-size: 10px;
    color: #10B981;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }}

  .page-footer {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #1F2937;
    padding-top: 8px;
    font-size: 10px;
    color: #64748B;
  }}

  /* Two Column Module Page Layout */
  .module-showcase-grid {{
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 16px;
    flex: 1;
    align-items: stretch;
  }}

  .module-info-col {{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }}

  .module-device-col {{
    display: flex;
    justify-content: center;
    align-items: center;
    background: radial-gradient(circle, rgba(31, 41, 55, 0.5) 0%, rgba(17, 24, 39, 0.8) 100%);
    border: 1px solid #1F2937;
    border-radius: 16px;
    padding: 10px;
    box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
  }}

  .phone-frame {{
    background: #000000;
    border: 3px solid #374151;
    border-radius: 28px;
    padding: 5px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7), 0 0 15px rgba(16, 185, 129, 0.2);
    display: inline-block;
    max-width: 100%;
  }}

  .phone-frame img {{
    display: block;
    width: 220px;
    height: auto;
    max-height: 232mm;
    object-fit: contain;
    border-radius: 22px;
  }}

  /* Cards */
  .card {{
    background-color: #111827;
    border: 1px solid #1F2937;
    border-radius: 10px;
    padding: 12px 14px;
  }}

  .card-evidence {{
    background: rgba(16, 185, 129, 0.06);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 10px;
    padding: 10px 12px;
    margin: 10px 0;
  }}

  .feature-item {{
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 7px;
    font-size: 11px;
    color: #CBD5E1;
  }}

  .feature-item strong {{
    color: #F8FAFC;
  }}

  .bullet-dot {{
    color: #10B981;
    font-weight: 900;
    flex-shrink: 0;
  }}

  /* Tables */
  table.pricing-table {{
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 11px;
  }}

  table.pricing-table th {{
    background: #1F2937;
    padding: 9px 12px;
    text-align: left;
    color: #F8FAFC;
    border-bottom: 2px solid #374151;
  }}

  table.pricing-table td {{
    padding: 8px 12px;
    border-bottom: 1px solid #1F2937;
    color: #CBD5E1;
  }}

  table.pricing-table tr:nth-child(even) {{
    background: rgba(31, 41, 55, 0.4);
  }}
</style>
</head>
<body>

<!-- ======================================================================= -->
<!-- PÁGINA 1: PORTADA EJECUTIVA                                            -->
<!-- ======================================================================= -->
<div class="page">
  <div class="glow-tr"></div>
  <div class="glow-bl"></div>

  <div style="display:flex; justify-content:space-between; align-items:center;">
    <span class="badge badge-emerald">⚡ VERSIÓN COMERCIAL 2026 · SECTIC S.A.S.</span>
    <span style="font-size:11px; color:#94A3B8; font-weight:600;">EVIDENCIAS & REGISTROS REALES</span>
  </div>

  <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:flex-start; padding:20px 0;">
    <img src="{logo_b64}" style="width:110px; height:110px; border-radius:22px; border:2px solid #10B981; box-shadow:0 10px 30px rgba(16,185,129,0.3); margin-bottom:24px;" alt="Logo">
    <h1 style="font-size:46px; font-weight:900; line-height:1.05; margin-bottom:12px; color:#FFFFFF;">
      SportCore<span style="color:#10B981;">OS</span>
    </h1>
    <h2 style="font-size:20px; font-weight:700; color:#06B6D4; margin-bottom:14px;">
      El Sistema Operativo Cloud para Academias & Clubes de Fútbol
    </h2>
    <p style="font-size:13.5px; color:#94A3B8; max-width:580px; margin-bottom:26px; line-height:1.6;">
      Dossier Comercial y Portafolio de Módulos con datos de operación en vivo. Descubra cómo transformar la gestión de su escuela deportiva, erradicar la morosidad y entregar una experiencia profesional a padres de familia y futbolistas.
    </p>

    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:14px; width:100%;">
      <div class="card" style="border-top:3px solid #10B981;">
        <div style="font-size:24px; font-weight:900; color:#10B981;">-80%</div>
        <div style="font-size:11px; color:#94A3B8; font-weight:700; text-transform:uppercase;">En Cartera Morosa</div>
        <div style="font-size:10px; color:#64748B; margin-top:3px;">Cobranza automática con PSE y tarjetas</div>
      </div>
      <div class="card" style="border-top:3px solid #06B6D4;">
        <div style="font-size:24px; font-weight:900; color:#06B6D4;">100%</div>
        <div style="font-size:11px; color:#94A3B8; font-weight:700; text-transform:uppercase;">Control en Cancha</div>
        <div style="font-size:10px; color:#64748B; margin-top:3px;">Asistencia, convocatorias y GPS</div>
      </div>
      <div class="card" style="border-top:3px solid #F59E0B;">
        <div style="font-size:24px; font-weight:900; color:#F59E0B;">48 Horas</div>
        <div style="font-size:11px; color:#94A3B8; font-weight:700; text-transform:uppercase;">Puesta en Marcha</div>
        <div style="font-size:10px; color:#64748B; margin-top:3px;">Migración masiva desde Excel</div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>Desarrollado y operado por <strong>SECTIC / SECTICSOLAR S.A.S.</strong> · NIT: 901.789.452-1</span>
    <span>https://sportcoreos.secticsolar.site · +57 311 705 1171</span>
  </div>
</div>


<!-- ======================================================================= -->
<!-- PÁGINA 2: DIAGNÓSTICO VS SOLUCIÓN                                      -->
<!-- ======================================================================= -->
<div class="page">
  <div class="page-header">
    <div>
      <div class="page-header-sub">DIAGNÓSTICO & VALOR ESTRATÉGICO</div>
      <div class="page-header-title">El Reto de la Academia Tradicional vs. SportCoreOS</div>
    </div>
    <span class="badge badge-cyan">TRANSFORMACIÓN DIGITAL</span>
  </div>

  <p style="color:#CBD5E1; font-size:12px; margin-bottom:14px;">
    Las escuelas deportivas tradicionales pierden entre un <strong>30% y un 45% de sus ingresos</strong> debido a la informalidad en los cobros por WhatsApp, sufren desorden en las convocatorias de fin de semana y carecen de métricas para justificar el valor formativo a los padres de familia.
  </p>

  <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px;">
    <!-- Problem -->
    <div class="card" style="border-color: rgba(239, 68, 68, 0.4); background: rgba(38, 20, 24, 0.6);">
      <div style="font-size:14px; font-weight:800; color:#F87171; margin-bottom:8px;">❌ Operación Tradicional (Papel y WhatsApp)</div>
      <ul style="list-style:none; font-size:11px; color:#CBD5E1;">
        <li style="margin-bottom:8px;"><strong style="color:#FECACA;">• Cobranzas Manuales:</strong> Pagos por transferencia sin conciliar en extractos y discusiones incómodas con padres morosos.</li>
        <li style="margin-bottom:8px;"><strong style="color:#FECACA;">• Convocatorias Improvisadas:</strong> Listas en chats de WhatsApp, jugadores que llegan a la cancha equivocada o citaciones canceladas a última hora.</li>
        <li style="margin-bottom:8px;"><strong style="color:#FECACA;">• Pérdida de Datos:</strong> Mediciones de peso, talla y test físicos anotados en libretas que se extravían y nunca se entregan al acudiente.</li>
        <li style="margin-bottom:8px;"><strong style="color:#FECACA;">• Dorsales Duplicados:</strong> Sanciones y pérdida de puntos en torneos por camisetas con el mismo número en planilla.</li>
        <li><strong style="color:#FECACA;">• Deserción de Alumnos:</strong> Padres que no perciben profesionalismo y matriculan a sus hijos en clubes con mayor tecnología.</li>
      </ul>
    </div>

    <!-- Solution -->
    <div class="card" style="border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 42, 34, 0.6);">
      <div style="font-size:14px; font-weight:800; color:#10B981; margin-bottom:8px;">✅ La Solución Integral con SportCoreOS</div>
      <ul style="list-style:none; font-size:11px; color:#CBD5E1;">
        <li style="margin-bottom:8px;"><strong style="color:#A7F3D0;">• Cobranza Automatizada PSE:</strong> Emisión mensual automática, pasarela de pago digital y estados de cuenta al día en el celular.</li>
        <li style="margin-bottom:8px;"><strong style="color:#A7F3D0;">• Citaciones Inteligentes con GPS:</strong> Convocatoria formal con titulares vs suplentes, ubicación Waze/Maps y confirmación del padre en 1 clic.</li>
        <li style="margin-bottom:8px;"><strong style="color:#A7F3D0;">• Ficha Deportiva 360°:</strong> Antropometría digital, test de velocidad/salto y semáforo preventivo de lesiones y sobreentrenamiento.</li>
        <li style="margin-bottom:8px;"><strong style="color:#A7F3D0;">• Matriz de Dorsales Únicos:</strong> Control automático de números asignados por categoría y tienda oficial de uniformes del club.</li>
        <li><strong style="color:#A7F3D0;">• Boletines Semestrales con IA:</strong> Informes técnicos generados con Inteligencia Artificial (Gemini) que enamoran a las familias.</li>
      </ul>
    </div>
  </div>

  <div class="card" style="background:#172338; border-color:#06B6D4;">
    <div style="font-size:13px; font-weight:800; color:#06B6D4; margin-bottom:3px;">📈 Retorno de Inversión Inmediato (ROI)</div>
    <p style="font-size:11px; color:#CBD5E1;">
      Al implementar SportCoreOS, una escuela con 100 alumnos recupera en promedio <strong>$2.500.000 COP al mes</strong> en mensualidades que antes se perdían por falta de seguimiento. La plataforma se paga sola desde el primer mes.
    </p>
  </div>

  <div class="page-footer">
    <span>SportCoreOS · Portafolio de Servicios Corporativo</span>
    <span>Página 02</span>
  </div>
</div>


<!-- ======================================================================= -->
<!-- PÁGINA 3: MÓDULO 1 - DASHBOARD EJECUTIVO                                -->
<!-- ======================================================================= -->
<div class="page">
  <div class="page-header">
    <div>
      <div class="page-header-sub">CATÁLOGO DE MÓDULOS · MÓDULO 01</div>
      <div class="page-header-title">Dashboard Ejecutivo & Gestión de Sedes</div>
    </div>
    <span class="badge badge-cyan">PANEL DE CONTROL</span>
  </div>

  <div class="module-showcase-grid">
    <div class="module-info-col">
      <div>
        <h3 style="font-size:17px; color:#F8FAFC; margin-bottom:6px;">Visibilidad Total de Atletas, Sedes y Categorías</h3>
        <p style="font-size:11.5px; color:#94A3B8; margin-bottom:12px;">
          El panel central permite al Director Deportivo y a los Administradores supervisar toda la academia en tiempo real: desde el estado de cartera de cada jugador hasta el próximo partido oficial.
        </p>

        <div class="card-evidence">
          <div style="font-size:11.5px; font-weight:800; color:#10B981; margin-bottom:4px;">👁️ Registros Reales Visibles en Pantalla:</div>
          <p style="font-size:11px; color:#E2E8F0;">
            • Atleta en foco: <strong>Samuel Díaz Restrepo (#10)</strong> · Categoría: <strong>Sub-15 Élite</strong>.<br>
            • Indicador de Rendimiento: <strong>94%</strong> · Estado Financiero: <strong>Paz y Salvo: Al día</strong>.<br>
            • Próximo Encuentro Oficial: <strong>Futuros Cracks FC vs. Atlético Nacional Cantera</strong>.<br>
            • Horario y Sede: <strong>Sábado 10:30 AM (Citación 09:30 AM)</strong> en <strong>Cancha Sintética Principal Los Arrayanes</strong> con enlace satelital <strong>GPS</strong>.
          </p>
        </div>

        <div style="margin-top:10px;">
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>KPIs en Tiempo Real:</strong> Cantidad de partidos activos, titulares disponibles y boletines de IA generados.</div></div>
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Multi-Sede y Categorías:</strong> Parametrización independiente de filiales, canchas y cuerpos técnicos.</div></div>
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Acceso Rápido Móvil:</strong> Navegación inferior con acceso inmediato a Partidos, Convocatoria, Tienda y Carnet.</div></div>
        </div>
      </div>

      <div class="card" style="border-left:3px solid #10B981;">
        <div style="font-weight:700; color:#10B981; font-size:11px;">Beneficio para el Club:</div>
        <div style="font-size:10.5px; color:#CBD5E1;">Elimina la necesidad de cruzar hojas de cálculo manuales; la junta directiva visualiza la salud deportiva y económica en una sola pantalla.</div>
      </div>
    </div>

    <div class="module-device-col">
      <div class="phone-frame">
        <img src="{shots['dashboard']}" alt="Dashboard Mockup">
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>SportCoreOS · Portafolio de Servicios Corporativo</span>
    <span>Página 03</span>
  </div>
</div>


<!-- ======================================================================= -->
<!-- PÁGINA 4: MÓDULO 2 - ASISTENCIA Y ENTRENAMIENTOS                        -->
<!-- ======================================================================= -->
<div class="page">
  <div class="page-header">
    <div>
      <div class="page-header-sub">CATÁLOGO DE MÓDULOS · MÓDULO 02</div>
      <div class="page-header-title">Entrenamientos & Control de Asistencia en Campo</div>
    </div>
    <span class="badge badge-emerald">GESTIÓN EN CANCHA</span>
  </div>

  <div class="module-showcase-grid">
    <div class="module-info-col">
      <div>
        <h3 style="font-size:17px; color:#F8FAFC; margin-bottom:6px;">Pase de Lista Digital en 30 Segundos</h3>
        <p style="font-size:11.5px; color:#94A3B8; margin-bottom:12px;">
          Permite a los directores técnicos pasar lista desde su teléfono inteligente en la cancha, planificar el objetivo del microciclo y recompensar la puntualidad y el esfuerzo.
        </p>

        <div class="card-evidence">
          <div style="font-size:11.5px; font-weight:800; color:#10B981; margin-bottom:4px;">👁️ Registros Reales Visibles en Pantalla:</div>
          <p style="font-size:11px; color:#E2E8F0;">
            • Categoría en Sesión: <strong>Sub-15 Élite A (11)</strong> en <strong>Sede Norte #2</strong> (16:00 - 18:00).<br>
            • Enfoque Táctico: <strong>Presión Alta & Definición</strong>.<br>
            • Balance en Vivo: <strong>8 Presentes, 1 Retraso, 1 Excusa Médica, 1 Falta</strong> (Efectividad: <strong>82%</strong>).<br>
            • Deportistas Registrados: <strong>Santiago Restrepo #8 (Mediocentro - Presente, Destacado +100 XP)</strong> y <strong>Mateo Gómez #10 (Enganche - Presente)</strong>.<br>
            • Función de Dictado por Voz y Código QR de Cancha para auto-registro de atletas.
          </p>
        </div>

        <div style="margin-top:10px;">
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Alerta Inmediata a Padres:</strong> Los acudientes reciben notificación instantánea si su hijo falta o llega con retraso.</div></div>
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Pase de Lista Delegado:</strong> El DT puede delegar el registro de asistencia al Capitán del equipo con un clic.</div></div>
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Intensidad & XP Deportivo:</strong> Recompensa el esfuerzo en entrenamiento con puntos de experiencia para el ranking.</div></div>
        </div>
      </div>

      <div class="card" style="border-left:3px solid #10B981;">
        <div style="font-weight:700; color:#10B981; font-size:11px;">Beneficio para el Club:</div>
        <div style="font-size:10.5px; color:#CBD5E1;">Acaba con las disputas con padres sobre inasistencias; el historial digital e inalterable respalda las decisiones de citación a partidos oficiales.</div>
      </div>
    </div>

    <div class="module-device-col">
      <div class="phone-frame">
        <img src="{shots['asistencia']}" alt="Asistencia Mockup">
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>SportCoreOS · Portafolio de Servicios Corporativo</span>
    <span>Página 04</span>
  </div>
</div>


<!-- ======================================================================= -->
<!-- PÁGINA 5: MÓDULO 3 - CALENDARIO & PARTIDOS                              -->
<!-- ======================================================================= -->
<div class="page">
  <div class="page-header">
    <div>
      <div class="page-header-sub">CATÁLOGO DE MÓDULOS · MÓDULO 03</div>
      <div class="page-header-title">Calendario Oficial, Partidos & Fixture Satelital</div>
    </div>
    <span class="badge badge-gold">COMPETENCIA REGIONAL</span>
  </div>

  <div class="module-showcase-grid">
    <div class="module-info-col">
      <div>
        <h3 style="font-size:17px; color:#F8FAFC; margin-bottom:6px;">Logística de Encuentros Oficiales sin Fricciones</h3>
        <p style="font-size:11.5px; color:#94A3B8; margin-bottom:12px;">
          Centraliza el fixture de todas las categorías del club, marcadores históricos, rivales, horas exactas de citación previa y ubicación GPS para padres y cuerpo técnico.
        </p>

        <div class="card-evidence">
          <div style="font-size:11.5px; font-weight:800; color:#F59E0B; margin-bottom:4px;">👁️ Registros Reales Visibles en Pantalla:</div>
          <p style="font-size:11px; color:#E2E8F0;">
            • Partido 1: <strong>Sub-17 Talentos</strong>: <strong>Futuros Cracks FC 2 - 0 Academia Millonarios FC</strong> (Visitante). Cancha Sintética 1 - Sede Principal (Citación: 08:30 AM).<br>
            • Partido 2: <strong>Sub-15 Élite</strong>: <strong>Futuros Cracks FC 2 - 0 Santa Fe Divisiones Menores</strong> (Local). Complejo Arrayanes Cancha 2.<br>
            • Partido 3: <strong>Sub-17 Talentos</strong>: <strong>Futuros Cracks FC 2 - 0 Deportivo Cali Filial Bogotá</strong>.<br>
            • Botón directo <strong>"Ver Convocatoria & Citación"</strong> y botón <strong>"GPS"</strong> para abrir la ruta en Google Maps y Waze.
          </p>
        </div>

        <div style="margin-top:10px;">
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Cero Familias Perdidas:</strong> El botón de GPS elimina las llamadas de última hora preguntando cómo llegar al estadio.</div></div>
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Horarios de Citación Claros:</strong> Distingue la hora de llegada al camerino (charla técnica) vs la hora del pitazo inicial.</div></div>
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Historial de Marcadores:</strong> Registro oficial de victorias, empates y derrotas por torneo y categoría.</div></div>
        </div>
      </div>

      <div class="card" style="border-left:3px solid #F59E0B;">
        <div style="font-weight:700; color:#F59E0B; font-size:11px;">Beneficio para el Club:</div>
        <div style="font-size:10.5px; color:#CBD5E1;">Puntualidad garantizada del plantel en torneos federados, evitando multas o pérdidas de puntos por W.O. (Walkover).</div>
      </div>
    </div>

    <div class="module-device-col">
      <div class="phone-frame">
        <img src="{shots['partidos']}" alt="Partidos Mockup">
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>SportCoreOS · Portafolio de Servicios Corporativo</span>
    <span>Página 05</span>
  </div>
</div>


<!-- ======================================================================= -->
<!-- PÁGINA 6: MÓDULO 4 - CONVOCATORIAS TÁCTICAS                             -->
<!-- ======================================================================= -->
<div class="page">
  <div class="page-header">
    <div>
      <div class="page-header-sub">CATÁLOGO DE MÓDULOS · MÓDULO 04</div>
      <div class="page-header-title">Convocatorias Inteligentes & Pizarra Táctica</div>
    </div>
    <span class="badge badge-emerald">ALINEACIÓN OFICIAL</span>
  </div>

  <div class="module-showcase-grid">
    <div class="module-info-col">
      <div>
        <h3 style="font-size:17px; color:#F8FAFC; margin-bottom:6px;">Selección Técnica del Plantel y Confirmación de Padres</h3>
        <p style="font-size:11.5px; color:#94A3B8; margin-bottom:12px;">
          El entrenador arma su equipo titular y banca de suplentes con dorsales oficiales; los acudientes reciben la notificación y confirman asistencia en tiempo real.
        </p>

        <div class="card-evidence">
          <div style="font-size:11.5px; font-weight:800; color:#10B981; margin-bottom:4px;">👁️ Registros Reales Visibles en Pantalla:</div>
          <p style="font-size:11px; color:#E2E8F0;">
            • Encuentro: <strong>Sub-17 Élite · Clausura</strong>: <strong>Futuros Cracks FC vs. Atlético Nacional</strong>.<br>
            • Plantel Convocado: <strong>11 Titulares (11)</strong> y <strong>5 Suplentes (5)</strong>.<br>
            • Nómina Titular Confirmada en Vivo:<br>
            &nbsp;&nbsp;• <strong>#1 Sebastián Muñoz</strong> (Arquero) · <span class="text-emerald font-bold">✔ CONFIRMADO</span><br>
            &nbsp;&nbsp;• <strong>#2 Andrés Salazar</strong> (Lateral Derecho) · <span class="text-emerald font-bold">✔ CONFIRMADO</span><br>
            &nbsp;&nbsp;• <strong>#3 Alejandro Ochoa</strong> (Defensa Central) · <span class="text-emerald font-bold">✔ CONFIRMADO</span><br>
            &nbsp;&nbsp;• <strong>#4 Nicolás Zapata</strong> (Defensa Central) · <span class="text-emerald font-bold">✔ CONFIRMADO</span><br>
            &nbsp;&nbsp;• <strong>#6 Samuel Vásquez</strong> (Lateral Izquierdo).<br>
            • Botón <strong>"Afiche IA"</strong> para generar el póster promocional de Matchday con Gemini.
          </p>
        </div>

        <div style="margin-top:10px;">
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Confirmación en 1 Clic:</strong> Cero dudas sobre si el futbolista asistirá; el padre presiona confirmar en su móvil.</div></div>
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Movilidad Titular/Suplente:</strong> Los botones de flecha permiten promover o rotar suplentes con un toque.</div></div>
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Control de Cuotas al Día:</strong> La vista de convocatoria alerta si el jugador presenta retrasos en su mensualidad.</div></div>
        </div>
      </div>

      <div class="card" style="border-left:3px solid #10B981;">
        <div style="font-weight:700; color:#10B981; font-size:11px;">Beneficio para el Club:</div>
        <div style="font-size:10.5px; color:#CBD5E1;">Acaba con la desorganización de planteles incompletos en el terreno de juego y proyecta una imagen de club profesional europeo.</div>
      </div>
    </div>

    <div class="module-device-col">
      <div class="phone-frame">
        <img src="{shots['convocatorias']}" alt="Convocatorias Mockup">
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>SportCoreOS · Portafolio de Servicios Corporativo</span>
    <span>Página 06</span>
  </div>
</div>


<!-- ======================================================================= -->
<!-- PÁGINA 7: MÓDULO 5 - BOLETÍN RENDIMIENTO CON IA                         -->
<!-- ======================================================================= -->
<div class="page">
  <div class="page-header">
    <div>
      <div class="page-header-sub">CATÁLOGO DE MÓDULOS · MÓDULO 05</div>
      <div class="page-header-title">Boletín de Rendimiento con IA (Gemini)</div>
    </div>
    <span class="badge badge-violet">INTELIGENCIA ARTIFICIAL</span>
  </div>

  <div class="module-showcase-grid">
    <div class="module-info-col">
      <div>
        <h3 style="font-size:17px; color:#F8FAFC; margin-bottom:6px;">Evaluaciones Deportivas Asistidas por IA</h3>
        <p style="font-size:11.5px; color:#94A3B8; margin-bottom:12px;">
          El motor de Inteligencia Artificial cruza la asistencia, test de velocidad, estadísticas de partidos y notas del entrenador para redactar un boletín técnico formal que enamora a los padres.
        </p>

        <div class="card-evidence">
          <div style="font-size:11.5px; font-weight:800; color:#8B5CF6; margin-bottom:4px;">👁️ Registros Reales Visibles en Pantalla:</div>
          <p style="font-size:11px; color:#E2E8F0;">
            • Deportista Evaluado: <strong>Mateo Morales (#10)</strong> · Delantero · <strong>Sub-15 A</strong>.<br>
            • Calificación Global: <strong>Overall Rating: 88/100</strong>.<br>
            • Análisis Táctico Gemini IA: <em>"Mateo demuestra una alta efectividad en transiciones ofensivas (85%) y aceleración en el último tercio de cancha. Se observa una notable mejora en el apoyo defensivo..."</em><br>
            • Fortaleza Detectada: <strong>Definición & Uno contra Uno</strong>.<br>
            • Foco de Trabajo en Casa: <strong>Orientación corporal en remate zurdo</strong>.<br>
            • Métricas Físicas Registradas: <strong>Velocidad Punta: 28.4 km/h</strong>, <strong>Precisión Pases: 88%</strong>, <strong>Distancia: 7.2 km</strong>, <strong>Resistencia Aeróbica: 92%</strong>.
          </p>
        </div>

        <div style="margin-top:10px;">
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Reducción de Deserción:</strong> Las familias valoran el rigor técnico y mantienen la matrícula activa año tras año.</div></div>
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Exportable en PDF Institucional:</strong> Documento con el escudo de su academia listo para descargar o imprimir.</div></div>
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Tareas Prácticas en el Hogar:</strong> La IA sugiere ejercicios específicos para que el atleta entrene fuera del club.</div></div>
        </div>
      </div>

      <div class="card" style="border-left:3px solid #8B5CF6;">
        <div style="font-weight:700; color:#8B5CF6; font-size:11px;">Beneficio para el Club:</div>
        <div style="font-size:10.5px; color:#CBD5E1;">Diferencial competitivo brutal: ninguna otra escuela de su ciudad entrega informes con Inteligencia Artificial y telemetría física.</div>
      </div>
    </div>

    <div class="module-device-col">
      <div class="phone-frame">
        <img src="{shots['boletin_ia']}" alt="Boletín IA Mockup">
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>SportCoreOS · Portafolio de Servicios Corporativo</span>
    <span>Página 07</span>
  </div>
</div>


<!-- ======================================================================= -->
<!-- PÁGINA 8: MÓDULO 6 - CARNET DIGITAL & VALIDACIÓN QR                    -->
<!-- ======================================================================= -->
<div class="page">
  <div class="page-header">
    <div>
      <div class="page-header-sub">CATÁLOGO DE MÓDULOS · MÓDULO 06</div>
      <div class="page-header-title">Carnet Digital del Jugador & Socio Pass QR</div>
    </div>
    <span class="badge badge-emerald">SEGURIDAD & ACREDITACIÓN</span>
  </div>

  <div class="module-showcase-grid">
    <div class="module-info-col">
      <div>
        <h3 style="font-size:17px; color:#F8FAFC; margin-bottom:6px;">Acreditación Oficial en el Celular Anti-Suplantación</h3>
        <p style="font-size:11.5px; color:#94A3B8; margin-bottom:12px;">
          Reemplaza los viejos carnets de plástico por una credencial digital en la billetera móvil (Apple Wallet / Google Wallet) con código QR encriptado para torneos y sedes.
        </p>

        <div class="card-evidence">
          <div style="font-size:11.5px; font-weight:800; color:#10B981; margin-bottom:4px;">👁️ Registros Reales Visibles en Pantalla:</div>
          <p style="font-size:11px; color:#E2E8F0;">
            • Titular del Pase: <strong>Mateo Morales Silva (#10)</strong> · Delantero Extremo · <strong>Sub-15 A</strong>.<br>
            • Estado: <strong>ACTIVO 2026</strong> · ID Socio: <strong>SC-2026-9482</strong> · Vigencia: <strong>31/DIC/2026</strong>.<br>
            • Código QR Dinámico: <em>"Código Verificado en Línea"</em> para validación de entrada por parte de jueces y veedores.<br>
            • Pestaña adicional: <strong>Ficha Médica SOS</strong> (tipo de sangre, EPS, alergias y póliza de seguro deportivo).<br>
            • Botón <strong>"Guardar en Billetera"</strong> para Apple Wallet y Android.
          </p>
        </div>

        <div style="margin-top:10px;">
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Cero Gasto de Plastificación:</strong> Ahorre millones de pesos anuales en impresión de carnets físicos que se pierden.</div></div>
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Blindaje Anti-Suplantación:</strong> Los organizadores de torneos escanean el QR y validan la inscripción real del menor.</div></div>
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Ficha Médica SOS Inmediata:</strong> En caso de lesión, el cuerpo médico accede al historial clínico al instante.</div></div>
        </div>
      </div>

      <div class="card" style="border-left:3px solid #10B981;">
        <div style="font-weight:700; color:#10B981; font-size:11px;">Beneficio para el Club:</div>
        <div style="font-size:10.5px; color:#CBD5E1;">Genera sentido de pertenencia y orgullo en los jóvenes deportistas al llevar el carnet digital de su club en su dispositivo.</div>
      </div>
    </div>

    <div class="module-device-col">
      <div class="phone-frame">
        <img src="{shots['carnet']}" alt="Carnet Mockup">
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>SportCoreOS · Portafolio de Servicios Corporativo</span>
    <span>Página 08</span>
  </div>
</div>


<!-- ======================================================================= -->
<!-- PÁGINA 9: MÓDULO 7 - TIENDA OFICIAL DEL CLUB                            -->
<!-- ======================================================================= -->
<div class="page">
  <div class="page-header">
    <div>
      <div class="page-header-sub">CATÁLOGO DE MÓDULOS · MÓDULO 07</div>
      <div class="page-header-title">Tienda Oficial & Gestión de Indumentaria</div>
    </div>
    <span class="badge badge-emerald">MONETIZACIÓN & KITS</span>
  </div>

  <div class="module-showcase-grid">
    <div class="module-info-col">
      <div>
        <h3 style="font-size:17px; color:#F8FAFC; margin-bottom:6px;">Comercio Electrónico Propio y Matriz de Dorsales</h3>
        <p style="font-size:11.5px; color:#94A3B8; margin-bottom:12px;">
          Monetice la marca de su club vendiendo uniformes oficiales, indumentaria de entrenamiento y accesorios deportivos directamente a los padres a través de la aplicación.
        </p>

        <div class="card-evidence">
          <div style="font-size:11.5px; font-weight:800; color:#10B981; margin-bottom:4px;">👁️ Registros Reales Visibles en Pantalla:</div>
          <p style="font-size:11px; color:#E2E8F0;">
            • Campaña Oficial: <strong>Colección 2026/2027</strong> · <em>"Viste con orgullo los colores del club"</em>.<br>
            • Filtros de Catálogo: <strong>Todos, Uniformes, Calzado, Accesorios</strong>.<br>
            • Productos & Precios en Vivo:<br>
            &nbsp;&nbsp;• <strong>Camiseta Oficial Titular 2026</strong>: <strong>$145.000 COP</strong> (Antes: $165.000).<br>
            &nbsp;&nbsp;• <strong>Uniforme de Presentación & Concentración</strong>: <strong>$210.000 COP</strong> (Antes: $240.000).<br>
            &nbsp;&nbsp;• Balón Oficial de Competición y Guayos con botón de compra rápida (+) a carrito.
          </p>
        </div>

        <div style="margin-top:10px;">
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Matriz de Dorsales Únicos:</strong> Impide que dos jugadores de la misma categoría elijan el mismo número de camiseta.</div></div>
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Control de Stock por Tallas:</strong> Inventario en tiempo real para mandar a confeccionar solo las prendas requeridas.</div></div>
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Pagos en Línea sin Filas:</strong> El acudiente paga el uniforme junto con la matrícula o mensualidad deportiva.</div></div>
        </div>
      </div>

      <div class="card" style="border-left:3px solid #10B981;">
        <div style="font-weight:700; color:#10B981; font-size:11px;">Beneficio para el Club:</div>
        <div style="font-size:10.5px; color:#CBD5E1;">Nueva línea de ingresos netos para la escuela; monetice el orgullo de los padres vendiendo indumentaria institucional.</div>
      </div>
    </div>

    <div class="module-device-col">
      <div class="phone-frame">
        <img src="{shots['tienda']}" alt="Tienda Mockup">
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>SportCoreOS · Portafolio de Servicios Corporativo</span>
    <span>Página 09</span>
  </div>
</div>


<!-- ======================================================================= -->
<!-- PÁGINA 10: MÓDULO 8 - ALQUILER DE CANCHAS                               -->
<!-- ======================================================================= -->
<div class="page">
  <div class="page-header">
    <div>
      <div class="page-header-sub">CATÁLOGO DE MÓDULOS · MÓDULO 08</div>
      <div class="page-header-title">Alquiler de Canchas & Gestión de Instalaciones</div>
    </div>
    <span class="badge badge-cyan">RENTABILIDAD DE SEDES</span>
  </div>

  <div class="module-showcase-grid">
    <div class="module-info-col">
      <div>
        <h3 style="font-size:17px; color:#F8FAFC; margin-bottom:6px;">Monetice las Horas Libres de sus Campos Deportivos</h3>
        <p style="font-size:11.5px; color:#94A3B8; margin-bottom:12px;">
          Sistema de reservas en línea para alquilar canchas sintéticas o de césped a clientes particulares, empresas y torneos externos en los horarios en que la escuela no entrena.
        </p>

        <div class="card-evidence">
          <div style="font-size:11.5px; font-weight:800; color:#06B6D4; margin-bottom:4px;">👁️ Registros Reales Visibles en Pantalla:</div>
          <p style="font-size:11px; color:#E2E8F0;">
            • Sede Principal: <strong>Complejo Deportivo El Prado</strong>.<br>
            • Tipos de Cancha: <strong>Fútbol 11, Fútbol 8, Fútbol 5</strong>.<br>
            • Selector de Fechas Interactivo (Mie 23, Jue 24, Vie 25, Sab 26, Dom 27).<br>
            • Escenario Activo: <strong>Cancha Estadio El Prado (F11 - Césped Natural)</strong>.<br>
            • Tarifa Parametrizada: <strong>$190.000 COP / hora</strong> con iluminación <strong>LED</strong>.<br>
            • Franjas Horarias Disponibles en Vivo: <strong>06:00 PM, 07:00 PM, 08:00 PM, 09:00 PM, 10:00 PM</strong>.
          </p>
        </div>

        <div style="margin-top:10px;">
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Cero Cruces de Horario:</strong> Disponibilidad visual que bloquea turnos automáticamente una vez reservados.</div></div>
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Tarifas Diferenciadas:</strong> Precios especiales para horarios nocturnos con luz artificial y fines de semana.</div></div>
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Anticipos en Línea:</strong> El cliente paga el 50% de depósito para garantizar la reserva del campo.</div></div>
        </div>
      </div>

      <div class="card" style="border-left:3px solid #06B6D4;">
        <div style="font-weight:700; color:#06B6D4; font-size:11px;">Beneficio para el Club:</div>
        <div style="font-size:10.5px; color:#CBD5E1;">Convierte las instalaciones deportivas en un centro de utilidades recurrentes que subsidia la operación de la academia.</div>
      </div>
    </div>

    <div class="module-device-col">
      <div class="phone-frame">
        <img src="{shots['canchas']}" alt="Canchas Mockup">
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>SportCoreOS · Portafolio de Servicios Corporativo</span>
    <span>Página 10</span>
  </div>
</div>


<!-- ======================================================================= -->
<!-- PÁGINA 11: MÓDULO 9 - ESTADO DE CUENTA & COBRANZAS PSE                 -->
<!-- ======================================================================= -->
<div class="page">
  <div class="page-header">
    <div>
      <div class="page-header-sub">CATÁLOGO DE MÓDULOS · MÓDULO 09</div>
      <div class="page-header-title">Estado de Cuenta, Cobranzas & Pasarela PSE</div>
    </div>
    <span class="badge badge-gold">CERO MOROSIDAD</span>
  </div>

  <div class="module-showcase-grid">
    <div class="module-info-col">
      <div>
        <h3 style="font-size:17px; color:#F8FAFC; margin-bottom:6px;">Automatización de Pagos de Pensión y Arbitrajes</h3>
        <p style="font-size:11.5px; color:#94A3B8; margin-bottom:12px;">
          Permite a las familias consultar sus recibos pendientes y pagar en 1 clic mediante PSE, Nequi y tarjetas, emitiendo comprobantes digitales y actualizando la cartera del club en el acto.
        </p>

        <div class="card-evidence">
          <div style="font-size:11.5px; font-weight:800; color:#F59E0B; margin-bottom:4px;">👁️ Registros Reales Visibles en Pantalla:</div>
          <p style="font-size:11px; color:#E2E8F0;">
            • Saldo Pendiente Total: <strong>$220.000 COP</strong> (Deportista: <strong>Samuel Díaz · Sub-15 Élite</strong>).<br>
            • Cuota 1 Pendiente: <strong>Pensión Deportiva Mensual: $180.000 COP</strong> (Vence: 30/09/2026) con botón directo <strong>"⚡ Pagar con PSE / Wompi"</strong>.<br>
            • Cuota 2 Pendiente: <strong>Cuota de Arbitraje Oficial: $40.000 COP</strong> (Vence: 25/09/2026).<br>
            • Historial de Recaudos Auditados: Cuota Arbitraje <strong>$180.000 COP</strong> (<span class="text-emerald font-bold">✔ PAGADO · Ref: WMP-PSE-20261-8923</span>) y Kit Indumentaria (<span class="text-emerald font-bold">✔ PAGADO</span>).
          </p>
        </div>

        <div style="margin-top:10px;">
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Conciliación Automática:</strong> Se acabaron las transferencias bancarias sin identificar; cada pago se asocia a la unidad.</div></div>
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Recibos Digitales con Código Único:</strong> Soporte fiscal y contable inmediato para la administración y el padre.</div></div>
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Bloqueo Preventivo:</strong> El sistema avisa si un jugador convocado debe cuotas antes de jugar el torneo.</div></div>
        </div>
      </div>

      <div class="card" style="border-left:3px solid #F59E0B;">
        <div style="font-weight:700; color:#F59E0B; font-size:11px;">Beneficio para el Club:</div>
        <div style="font-size:10.5px; color:#CBD5E1;">Reduce la morosidad a menos del 8% y ahorra cientos de horas al mes en llamadas y mensajes de cobro incómodos.</div>
      </div>
    </div>

    <div class="module-device-col">
      <div class="phone-frame">
        <img src="{shots['pagos']}" alt="Pagos Mockup">
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>SportCoreOS · Portafolio de Servicios Corporativo</span>
    <span>Página 11</span>
  </div>
</div>


<!-- ======================================================================= -->
<!-- PÁGINA 12: MÓDULO 10 - MODO CARRERA GAMIFICADO                          -->
<!-- ======================================================================= -->
<div class="page">
  <div class="page-header">
    <div>
      <div class="page-header-sub">CATÁLOGO DE MÓDULOS · MÓDULO 10</div>
      <div class="page-header-title">Modo Carrera: Carta de Jugador, Retos & XP</div>
    </div>
    <span class="badge badge-emerald">GAMIFICACIÓN & FORMACIÓN</span>
  </div>

  <div class="module-showcase-grid">
    <div class="module-info-col">
      <div>
        <h3 style="font-size:17px; color:#F8FAFC; margin-bottom:6px;">Motivación y Aprendizaje Conectado con la Cancha</h3>
        <p style="font-size:11.5px; color:#94A3B8; margin-bottom:12px;">
          El deportista visualiza su carta técnica personalizada inspirada en videojuegos profesionales, desbloquea niveles de aprendizaje, completa misiones y acumula puntos de experiencia (XP).
        </p>

        <div class="card-evidence">
          <div style="font-size:11.5px; font-weight:800; color:#10B981; margin-bottom:4px;">👁️ Registros Reales Visibles en Pantalla:</div>
          <p style="font-size:11px; color:#E2E8F0;">
            • Carta Profesional: <strong>Carlos · Rating 84 EXT (Plata)</strong> · <strong>Sub-15 Élite</strong>.<br>
            • Atributos en Campo: <strong>87 RIT</strong>, <strong>82 TIR</strong>, <strong>85 PAS</strong>, <strong>86 REG</strong>, <strong>66 DEF</strong>, <strong>80 FÍS</strong>.<br>
            • Rango de Progresión: <strong>Nivel 7 (120/500 XP)</strong> hacia Rango Oro.<br>
            • Puntos Acumulados: <strong>3.120 XP</strong>.<br>
            • Retos Físicos & Técnicos DT: <strong>Flexiones de Pecho Estrictas</strong> (Nivel 1 Aprobado +30 XP, Nivel 2 En Cancha +60 XP, Nivel 3 +100 XP).<br>
            • Regla de Salto en Cascada para deportistas avanzados.
          </p>
        </div>

        <div style="margin-top:10px;">
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Cero Abandono de Entrenamientos:</strong> Los niños entrenan con ilusión de subir los números de su carta oficial.</div></div>
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Gamificación Pedagógica Positiva:</strong> Recompensa el esfuerzo, la disciplina y la superación personal sin etiquetar negativamente.</div></div>
          <div class="feature-item"><span class="bullet-dot">✔</span><div><strong>Supervisión del Entrenador:</strong> Cada reto debe ser verificado en persona por el DT antes de otorgar el XP.</div></div>
        </div>
      </div>

      <div class="card" style="border-left:3px solid #10B981;">
        <div style="font-weight:700; color:#10B981; font-size:11px;">Beneficio para el Club:</div>
        <div style="font-size:10.5px; color:#CBD5E1;">Fidelización masiva de los alumnos; el club se convierte en una experiencia atractiva que compite con el ocio digital de los jóvenes.</div>
      </div>
    </div>

    <div class="module-device-col">
      <div class="phone-frame">
        <img src="{shots['carrera']}" alt="Modo Carrera Mockup">
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>SportCoreOS · Portafolio de Servicios Corporativo</span>
    <span>Página 12</span>
  </div>
</div>


<!-- ======================================================================= -->
<!-- PÁGINA 13: ONBOARDING EN 48 HORAS & CONTACTO COMERCIAL                 -->
<!-- ======================================================================= -->
<div class="page">
  <div class="glow-tr"></div>

  <div class="page-header">
    <div>
      <div class="page-header-sub">ONBOARDING ÁGIL & CONTACTO</div>
      <div class="page-header-title">Comience a Operar como un Club Profesional</div>
    </div>
    <span class="badge badge-emerald">DESPLIEGUE EN 48 HORAS</span>
  </div>

  <h3 style="font-size:16px; margin-bottom:12px; color:#F8FAFC;">Plan de Despliegue Express en 3 Pasos Sencillos:</h3>

  <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:16px;">
    <div class="card" style="border-top:3px solid #F59E0B;">
      <div style="font-size:12px; font-weight:800; color:#F59E0B; margin-bottom:3px;">PASO 1: MIGRACIÓN</div>
      <div style="font-size:10.5px; color:#CBD5E1;">
        Nos entrega su listado de deportistas y categorías en Excel. Nuestro equipo técnico carga y estructura la información en menos de 24 horas.
      </div>
    </div>

    <div class="card" style="border-top:3px solid #06B6D4;">
      <div style="font-size:12px; font-weight:800; color:#06B6D4; margin-bottom:3px;">PASO 2: CAPACITACIÓN</div>
      <div style="font-size:10.5px; color:#CBD5E1;">
        Taller práctico en vivo de 45 minutos para sus entrenadores y directores sobre uso de convocatorias, asistencia y cobros en línea.
      </div>
    </div>

    <div class="card" style="border-top:3px solid #10B981;">
      <div style="font-size:12px; font-weight:800; color:#10B981; margin-bottom:3px;">PASO 3: LANZAMIENTO</div>
      <div style="font-size:10.5px; color:#CBD5E1;">
        Envío masivo de accesos a los padres de familia con un kit gráfico personalizado para empezar a pagar y confirmar citaciones.
      </div>
    </div>
  </div>

  <!-- Contact Big Card -->
  <div class="card" style="background:#111827; border:2px solid #10B981; padding:20px; margin-bottom:16px;">
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
      <div>
        <h2 style="font-size:20px; color:#F8FAFC; margin-bottom:3px;">Agende su Demostración en Vivo</h2>
        <p style="font-size:12px; color:#94A3B8;">Conozca cómo SportCoreOS puede transformar su academia en una llamada de 15 minutos.</p>
      </div>
      <span class="badge badge-emerald">ATENCIÓN INMEDIATA</span>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:8px;">
      <div>
        <div style="font-size:11px; color:#94A3B8; margin-bottom:2px;">📱 Línea Directa & WhatsApp Comercial:</div>
        <div style="font-size:15px; font-weight:800; color:#10B981; margin-bottom:10px;">+57 311 705 1171</div>

        <div style="font-size:11px; color:#94A3B8; margin-bottom:2px;">📧 Correo Electrónico Corporativo:</div>
        <div style="font-size:13.5px; font-weight:700; color:#F8FAFC; margin-bottom:10px;">anroswell@gmail.com</div>

        <div style="font-size:11px; color:#94A3B8; margin-bottom:2px;">📍 Sede Comercial:</div>
        <div style="font-size:12px; color:#CBD5E1;">Cartagena de Indias, Colombia (Servicio para toda Latinoamérica)</div>
      </div>

      <div>
        <div style="font-size:11px; color:#94A3B8; margin-bottom:2px;">🌐 Plataforma & Demo en Línea:</div>
        <div style="font-size:13.5px; font-weight:700; color:#06B6D4; margin-bottom:10px;">https://sportcoreos.secticsolar.site</div>

        <div style="font-size:11px; color:#94A3B8; margin-bottom:2px;">🏢 Desarrollado y Respaldado por:</div>
        <div style="font-size:13.5px; font-weight:800; color:#F8FAFC; margin-bottom:3px;">SECTIC / SECTICSOLAR S.A.S.</div>
        <div style="font-size:10.5px; color:#94A3B8;">Líderes en desarrollo de ecosistemas SaaS, automatización y software de alta disponibilidad.</div>
      </div>
    </div>
  </div>

  <div style="text-align:center; font-size:11px; color:#94A3B8;">
    © 2026 SportCoreOS · Todos los derechos reservados · Desarrollado por SECTIC S.A.S.
  </div>

  <div class="page-footer">
    <span>SportCoreOS · Portafolio de Servicios Corporativo</span>
    <span>Página 13</span>
  </div>
</div>

</body>
</html>
"""

with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML generated at {OUTPUT_HTML}")

# Render to PDF using Chrome Headless
chrome_cmd = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={OUTPUT_PDF}",
    OUTPUT_HTML
]

print("Rendering PDF via Google Chrome headless...")
res = subprocess.run(chrome_cmd, capture_output=True, text=True)
if res.returncode == 0:
    print(f"PDF generated successfully at {OUTPUT_PDF}")
else:
    print(f"Chrome error: {res.stderr}")
