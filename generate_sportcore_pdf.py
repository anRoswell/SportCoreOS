import os
import base64
import subprocess

ROOT_DIR = "/Users/sectic/Documents/Codigos Fuentes/SportCoreOS"
OUTPUT_HTML = os.path.join(ROOT_DIR, "portafolio_sportcore.html")
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
icon_b64 = img_to_base64(os.path.join(ROOT_DIR, "branding/sportcore_icon.jpg"))
banner_b64 = img_to_base64(os.path.join(ROOT_DIR, "branding/sportcore_marketing_banner.jpg"))

# Screenshots
shots = {
    "dashboard": img_to_base64(os.path.join(ROOT_DIR, "assets/screenshots/01_inicio_dashboard_raw.png")),
    "asistencia": img_to_base64(os.path.join(ROOT_DIR, "assets/screenshots/02_entrenamientos_asistencia_raw.png")),
    "partidos": img_to_base64(os.path.join(ROOT_DIR, "assets/screenshots/03_partidos_calendario_raw.png")),
    "convocatorias": img_to_base64(os.path.join(ROOT_DIR, "assets/screenshots/04_convocatorias_tactica_raw.png")),
    "canchas": img_to_base64(os.path.join(ROOT_DIR, "assets/screenshots/05_canchas_alquiler_raw.png")),
    "boletin_ia": img_to_base64(os.path.join(ROOT_DIR, "assets/screenshots/06_boletin_rendimiento_ia_raw.png")),
    "carnet": img_to_base64(os.path.join(ROOT_DIR, "assets/screenshots/07_carnet_digital_jugador_raw.png")),
    "tienda": img_to_base64(os.path.join(ROOT_DIR, "assets/screenshots/08_tienda_kits_oficiales_raw.png")),
}

html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>SportCoreOS — Portafolio de Servicios Corporativo</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

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
    font-size: 13px;
    line-height: 1.5;
  }}

  .page {{
    width: 210mm;
    height: 297mm;
    padding: 20mm 18mm;
    position: relative;
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    background-color: #0B0F19;
  }}

  /* Background Glows */
  .glow-top-right {{
    position: absolute;
    top: -80px;
    right: -80px;
    width: 320px;
    height: 320px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(11, 15, 25, 0) 70%);
    border-radius: 50%;
    pointer-events: none;
  }}

  .glow-bottom-left {{
    position: absolute;
    bottom: -80px;
    left: -80px;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(11, 15, 25, 0) 70%);
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
    gap: 6px;
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 11px;
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

  /* Cards */
  .card {{
    background-color: #111827;
    border: 1px solid #1F2937;
    border-radius: 12px;
    padding: 16px;
  }}

  .card-highlight {{
    background: linear-gradient(145deg, #111827 0%, #172338 100%);
    border: 1px solid rgba(16, 185, 129, 0.3);
  }}

  /* Headers & Footers */
  .page-header {{
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-bottom: 2px solid #1F2937;
    padding-bottom: 12px;
    margin-bottom: 16px;
  }}

  .page-header-title {{
    font-size: 20px;
    font-weight: 800;
    color: #F8FAFC;
  }}

  .page-header-sub {{
    font-size: 11px;
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
    padding-top: 10px;
    font-size: 10.5px;
    color: #64748B;
  }}

  /* Grid Layouts */
  .grid-2 {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }}

  .grid-3 {{
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 14px;
  }}

  /* Module Showcase Component */
  .module-container {{
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 20px;
    align-items: center;
    margin-bottom: 16px;
    background: #111827;
    border: 1px solid #1F2937;
    border-radius: 14px;
    padding: 18px;
  }}

  .module-feature-list {{
    list-style: none;
    margin-top: 10px;
  }}

  .module-feature-list li {{
    margin-bottom: 8px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 11.5px;
    color: #CBD5E1;
  }}

  .module-feature-list li strong {{
    color: #F8FAFC;
  }}

  .check-icon {{
    color: #10B981;
    font-weight: 900;
    flex-shrink: 0;
  }}

  .phone-mockup {{
    background: #0B0F19;
    border: 2px solid #374151;
    border-radius: 20px;
    padding: 6px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    text-align: center;
  }}

  .phone-mockup img {{
    width: 100%;
    max-height: 255px;
    object-fit: cover;
    border-radius: 14px;
    display: block;
  }}

  /* Pricing Table */
  table.pricing-table {{
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 11.5px;
  }}

  table.pricing-table th {{
    background: #1F2937;
    padding: 10px 12px;
    text-align: left;
    color: #F8FAFC;
    border-bottom: 2px solid #374151;
  }}

  table.pricing-table td {{
    padding: 9px 12px;
    border-bottom: 1px solid #1F2937;
    color: #CBD5E1;
  }}

  table.pricing-table tr:nth-child(even) {{
    background: rgba(31, 41, 55, 0.4);
  }}

  /* Cover Specifics */
  .cover-content {{
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 20px 0;
  }}

  .cover-logo {{
    width: 110px;
    height: 110px;
    border-radius: 22px;
    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
    margin-bottom: 25px;
    border: 2px solid #10B981;
  }}

  .cover-title {{
    font-size: 46px;
    font-weight: 900;
    line-height: 1.05;
    margin-bottom: 12px;
    background: linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 60%, #10B981 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }}

  .cover-subtitle {{
    font-size: 20px;
    font-weight: 600;
    color: #06B6D4;
    margin-bottom: 16px;
  }}

  .cover-desc {{
    font-size: 14px;
    color: #94A3B8;
    max-width: 580px;
    margin-bottom: 30px;
    line-height: 1.6;
  }}

  .cover-stats {{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    width: 100%;
    margin-top: 15px;
  }}

  .stat-card {{
    background: #111827;
    border: 1px solid #1F2937;
    border-radius: 12px;
    padding: 16px;
    border-top: 3px solid #10B981;
  }}

  .stat-number {{
    font-size: 24px;
    font-weight: 900;
    color: #F8FAFC;
  }}

  .stat-label {{
    font-size: 11px;
    color: #94A3B8;
    font-weight: 600;
    text-transform: uppercase;
  }}
</style>
</head>
<body>

<!-- ======================================================================= -->
<!-- PÁGINA 1: PORTADA EJECUTIVA                                            -->
<!-- ======================================================================= -->
<div class="page">
  <div class="glow-top-right"></div>
  <div class="glow-bottom-left"></div>

  <div style="display:flex; justify-content:space-between; align-items:center;">
    <span class="badge badge-emerald">⚡ VERSIÓN COMERCIAL 2026.4 · SECTIC S.A.S.</span>
    <span style="font-size:11px; color:#94A3B8; font-weight:600;">COBERTURA NACIONAL & INTERNACIONAL</span>
  </div>

  <div class="cover-content">
    <img src="{logo_b64}" class="cover-logo" alt="SportCoreOS Logo">
    <h1 class="cover-title">SportCoreOS</h1>
    <h2 class="cover-subtitle">El Ecosistema Cloud de Alto Rendimiento para Academias & Clubes de Fútbol</h2>
    <p class="cover-desc">
      La plataforma integral diseñada para profesionalizar y automatizar el 100% de la gestión deportiva, médica, biométrica, táctica y financiera de escuelas formativas y clubes deportivos de alto nivel.
    </p>

    <div class="cover-stats">
      <div class="stat-card">
        <div class="stat-number text-emerald">-80%</div>
        <div class="stat-label">En Cartera Morosa</div>
        <div style="font-size:10.5px; color:#64748B; margin-top:4px;">Cobranza automática PSE / Tarjetas</div>
      </div>
      <div class="stat-card" style="border-top-color: #06B6D4;">
        <div class="stat-number text-cyan">100%</div>
        <div class="stat-label">Trazabilidad Ficha 360°</div>
        <div style="font-size:10.5px; color:#64748B; margin-top:4px;">Biometría, tests físicos y radar</div>
      </div>
      <div class="stat-card" style="border-top-color: #F59E0B;">
        <div class="stat-number text-gold">48 Horas</div>
        <div class="stat-label">Puesta en Marcha</div>
        <div style="font-size:10.5px; color:#64748B; margin-top:4px;">Migración masiva desde Excel</div>
      </div>
    </div>
  </div>

  <div class="page-footer">
    <span>Desarrollado con orgullo por <strong>SECTIC SOLAR S.A.S.</strong> · NIT: 901.789.452-1</span>
    <span>https://sportcore.site · anroswell@gmail.com</span>
  </div>
</div>


<!-- ======================================================================= -->
<!-- PÁGINA 2: DIAGNÓSTICO DEL SECTOR & LA SOLUCIÓN INTEGRAL                -->
<!-- ======================================================================= -->
<div class="page">
  <div class="page-header">
    <div>
      <div class="page-header-sub">DIAGNÓSTICO & VALOR AGREGADO</div>
      <div class="page-header-title">El Reto de la Academia Tradicional vs. SportCoreOS</div>
    </div>
    <span class="badge badge-cyan">TRANSFORMACIÓN DIGITAL</span>
  </div>

  <p style="color:#CBD5E1; font-size:12.5px; margin-bottom:16px;">
    La mayoría de las academias de fútbol formativo pierden entre un <strong>30% y un 45% de sus ingresos</strong> debido a la cobranza manual en efectivo y WhatsApp, sufren desorden en los partidos de fin de semana y carecen de métricas científicas para justificar el valor de la mensualidad a los padres.
  </p>

  <div class="grid-2" style="margin-bottom:18px;">
    <!-- Problem Box -->
    <div class="card" style="border-color: rgba(239, 68, 68, 0.4); background: rgba(38, 20, 24, 0.6);">
      <div style="font-size:15px; font-weight:800; color:#F87171; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
        <span>❌</span> La Gestión Tradicional en Papel y WhatsApp
      </div>
      <ul style="list-style:none; font-size:11.5px; color:#CBD5E1;">
        <li style="margin-bottom:10px;">
          <strong style="color:#FECACA;">• Morosidad Asfixiante:</strong> Pagos por transferencia sin conciliar, recibos de talonario que se pierden y discusiones incómodas con padres morosos.
        </li>
        <li style="margin-bottom:10px;">
          <strong style="color:#FECACA;">• Convocatorias Caóticas:</strong> Listas improvisadas en grupos de WhatsApp, confusión de canchas y jugadores que no llegan a la hora pactada.
        </li>
        <li style="margin-bottom:10px;">
          <strong style="color:#FECACA;">• Pérdida de Datos Biométricos:</strong> Test físicos y datos de crecimiento anotados en libretas que jamás se entregan a las familias.
        </li>
        <li style="margin-bottom:10px;">
          <strong style="color:#FECACA;">• Dorsales Repetidos:</strong> Sanciones y pérdida de puntos en torneos oficiales por camisetas duplicadas en planilla.
        </li>
        <li>
          <strong style="color:#FECACA;">• Alta Deserción de Alumnos:</strong> Los acudientes sienten que pagan una mensualidad sin ver un seguimiento profesional y formal.
        </li>
      </ul>
    </div>

    <!-- Solution Box -->
    <div class="card card-highlight">
      <div style="font-size:15px; font-weight:800; color:#10B981; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
        <span>✅</span> La Revolución Integral con SportCoreOS
      </div>
      <ul style="list-style:none; font-size:11.5px; color:#CBD5E1;">
        <li style="margin-bottom:10px;">
          <strong style="color:#A7F3D0;">• Cobranzas Digitales Automatizadas:</strong> Recaudos por pasarela PSE, Nequi y tarjetas de crédito con estados de cuenta en línea y recordatorios.
        </li>
        <li style="margin-bottom:10px;">
          <strong style="color:#A7F3D0;">• Citaciones Inteligentes con GPS:</strong> Convocatoria con titulares vs suplentes, ubicación Waze/Maps y confirmación del padre en 1 clic.
        </li>
        <li style="margin-bottom:10px;">
          <strong style="color:#A7F3D0;">• Ficha Deportiva & Radar 360°:</strong> Antropometría, tests de condición física (velocidad, Cooper, salto) y prevención de lesiones (ACWR).
        </li>
        <li style="margin-bottom:10px;">
          <strong style="color:#A7F3D0;">• Matriz de Dorsales & Tienda Oficial:</strong> Control estricto de números asignados y venta organizada de indumentaria y accesorios.
        </li>
        <li>
          <strong style="color:#A7F3D0;">• Boletines Semestrales con IA:</strong> Informes técnicos de rendimiento asistidos por Inteligencia Artificial que enamoran a las familias.
        </li>
      </ul>
    </div>
  </div>

  <div class="card" style="background:#172338; border-color:#06B6D4;">
    <div style="font-size:13px; font-weight:800; color:#06B6D4; margin-bottom:4px;">🚀 Impacto Directo en la Rentabilidad del Club</div>
    <p style="font-size:11.5px; color:#CBD5E1;">
      Al implementar SportCoreOS, una academia de 120 alumnos recupera en promedio <strong>$2.800.000 COP mensuales</strong> en cartera que antes se daba por perdida, aumenta la retención de deportistas en un <strong>38%</strong> y genera ingresos colaterales gracias a la tienda de uniformes y alquiler de canchas.
    </p>
  </div>

  <div class="page-footer">
    <span>SportCoreOS · Dossier Comercial & Portafolio 2026</span>
    <span>Página 02</span>
  </div>
</div>


<!-- ======================================================================= -->
<!-- PÁGINA 3: ECOSISTEMA MULTI-ROL (WEB & MÓVIL)                            -->
<!-- ======================================================================= -->
<div class="page">
  <div class="page-header">
    <div>
      <div class="page-header-sub">ARQUITECTURA DE LA PLATAFORMA</div>
      <div class="page-header-title">Ecosistema Conectado en Tiempo Real</div>
    </div>
    <span class="badge badge-gold">EXPERIENCIA MULTI-ROL</span>
  </div>

  <p style="color:#CBD5E1; font-size:12.5px; margin-bottom:16px;">
    SportCoreOS no es un software aislado: es una red viva que sincroniza instantáneamente al <strong>Director de la Escuela</strong>, al <strong>Cuerpo Técnico</strong> en cancha, a los <strong>Padres de Familia</strong> y a los <strong>Deportistas</strong> a través de interfaces diseñadas para cada perfil.
  </p>

  <div class="grid-3" style="margin-bottom:18px;">
    <div class="card" style="border-top:3px solid #F59E0B;">
      <div style="font-size:14px; font-weight:800; color:#F59E0B; margin-bottom:4px;">🏢 Panel Administrativo Web</div>
      <div style="font-size:10px; color:#94A3B8; margin-bottom:10px; font-style:italic;">Directores, Contadores & Consejo</div>
      <ul style="list-style:none; font-size:11px; color:#CBD5E1;">
        <li style="margin-bottom:6px;">✔ Dashboard de ingresos y cartera morosa en tiempo real.</li>
        <li style="margin-bottom:6px;">✔ Configuración de categorías (Sub-7 a Sub-20), sedes y filiales.</li>
        <li style="margin-bottom:6px;">✔ Emisión masiva de mensualidades y cargos extraordinarios.</li>
        <li style="margin-bottom:6px;">✔ Control de inventario de uniformes y alquiler de canchas.</li>
        <li>✔ Asignación de permisos de acceso y roles de staff.</li>
      </ul>
    </div>

    <div class="card" style="border-top:3px solid #10B981;">
      <div style="font-size:14px; font-weight:800; color:#10B981; margin-bottom:4px;">⚽ App Entrenadores & DTs</div>
      <div style="font-size:10px; color:#94A3B8; margin-bottom:10px; font-style:italic;">Profesores & Preparadores Físicos</div>
      <ul style="list-style:none; font-size:11px; color:#CBD5E1;">
        <li style="margin-bottom:6px;">✔ Pase de lista digital de asistencia en 30 segundos.</li>
        <li style="margin-bottom:6px;">✔ Armado de convocatorias a partidos (titular vs suplente).</li>
        <li style="margin-bottom:6px;">✔ Registro de test físicos, antropometría y notas tácticas.</li>
        <li style="margin-bottom:6px;">✔ Acta digital de partido en vivo (goles, tarjetas, MVP).</li>
        <li>✔ Asignación de retos semanales y video-drills.</li>
      </ul>
    </div>

    <div class="card" style="border-top:3px solid #06B6D4;">
      <div style="font-size:14px; font-weight:800; color:#06B6D4; margin-bottom:4px;">👨‍👩‍👦 App Familias & Jugadores</div>
      <div style="font-size:10px; color:#94A3B8; margin-bottom:10px; font-style:italic;">Acudientes & Atletas en Formación</div>
      <ul style="list-style:none; font-size:11px; color:#CBD5E1;">
        <li style="margin-bottom:6px;">✔ Citación a partidos con confirmación y ruta GPS.</li>
        <li style="margin-bottom:6px;">✔ Estados de cuenta y pago de pensión en línea (PSE).</li>
        <li style="margin-bottom:6px;">✔ Carnet digital oficial con código QR anti-suplantación.</li>
        <li style="margin-bottom:6px;">✔ Descarga de boletines semestrales generados con IA.</li>
        <li>✔ Modo carrera gamificado con insignias y niveles.</li>
      </ul>
    </div>
  </div>

  <div class="card" style="background:#111827; border-color:#374151;">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="font-size:13px; font-weight:800; color:#F8FAFC;">📱 Compatibilidad Multi-Plataforma Total</div>
        <div style="font-size:11px; color:#94A3B8;">Funciona de forma fluida en smartphones (iOS & Android), tablets iPad/Android, ordenadores Mac y PC.</div>
      </div>
      <span class="badge badge-emerald">MODO OSCURO / CLARO</span>
    </div>
  </div>

  <div class="page-footer">
    <span>SportCoreOS · Dossier Comercial & Portafolio 2026</span>
    <span>Página 03</span>
  </div>
</div>


<!-- ======================================================================= -->
<!-- PÁGINA 4: MÓDULOS 1 Y 2 (DASHBOARD & ASISTENCIA)                       -->
<!-- ======================================================================= -->
<div class="page">
  <div class="page-header">
    <div>
      <div class="page-header-sub">CATÁLOGO DE MÓDULOS · MÓDULOS 01 & 02</div>
      <div class="page-header-title">Gestión de Sedes & Asistencia en Campo</div>
    </div>
    <span class="badge badge-emerald">OPERACIÓN DIARIA</span>
  </div>

  <!-- Module 1 -->
  <div class="module-container">
    <div>
      <span class="badge badge-cyan" style="margin-bottom:6px;">MÓDULO 01</span>
      <h3 style="font-size:16px; margin-bottom:4px;">Dashboard Ejecutivo & Sedes</h3>
      <p style="font-size:11.5px; color:#94A3B8; margin-bottom:8px;">Control gerencial de alumnos, categorías activas e indicadores en vivo.</p>
      <ul class="module-feature-list">
        <li><span class="check-icon">✔</span><div><strong>KPIs Deportivos y Financieros:</strong> Total matriculados, % de asistencia general y recaudo mensual.</div></li>
        <li><span class="check-icon">✔</span><div><strong>Segmentación por Edades:</strong> Gestión estructurada de planteles desde Sub-7 hasta Sub-20.</div></li>
        <li><span class="check-icon">✔</span><div><strong>Multi-Sede:</strong> Administre filiales y canchas independientes bajo una misma cuenta.</div></li>
        <li><span class="check-icon">✔</span><div><strong>Asignación de Staff Técnico:</strong> Asigne DT y preparador físico a cada categoría.</div></li>
      </ul>
    </div>
    <div class="phone-mockup">
      <img src="{shots['dashboard']}" alt="Dashboard Mockup">
    </div>
  </div>

  <!-- Module 2 -->
  <div class="module-container">
    <div>
      <span class="badge badge-emerald" style="margin-bottom:6px;">MÓDULO 02</span>
      <h3 style="font-size:16px; margin-bottom:4px;">Entrenamientos & Control de Asistencia</h3>
      <p style="font-size:11.5px; color:#94A3B8; margin-bottom:8px;">Pase de lista digital en 30 segundos y planificación de microciclos formativos.</p>
      <ul class="module-feature-list">
        <li><span class="check-icon">✔</span><div><strong>Pase de Lista con 1 Toque:</strong> Marque Presente, Justificado o Falta desde el móvil.</div></li>
        <li><span class="check-icon">✔</span><div><strong>Objetivo de Sesión:</strong> Defina el foco táctico (posesión, transiciones, remate).</div></li>
        <li><span class="check-icon">✔</span><div><strong>Alerta Inmediata a Familias:</strong> Notificación al padre cuando su hijo falta a entrenar.</div></li>
        <li><span class="check-icon">✔</span><div><strong>Historial de Cumplimiento:</strong> Porcentaje mínimo de asistencia para ser convocado.</div></li>
      </ul>
    </div>
    <div class="phone-mockup">
      <img src="{shots['asistencia']}" alt="Asistencia Mockup">
    </div>
  </div>

  <div class="page-footer">
    <span>SportCoreOS · Dossier Comercial & Portafolio 2026</span>
    <span>Página 04</span>
  </div>
</div>


<!-- ======================================================================= -->
<!-- PÁGINA 5: MÓDULOS 3 Y 4 (PARTIDOS & CONVOCATORIAS)                      -->
<!-- ======================================================================= -->
<div class="page">
  <div class="page-header">
    <div>
      <div class="page-header-sub">CATÁLOGO DE MÓDULOS · MÓDULOS 03 & 04</div>
      <div class="page-header-title">Calendario de Partidos & Convocatorias Tácticas</div>
    </div>
    <span class="badge badge-gold">COMPETENCIA OFICIAL</span>
  </div>

  <!-- Module 3 -->
  <div class="module-container">
    <div>
      <span class="badge badge-gold" style="margin-bottom:6px;">MÓDULO 03</span>
      <h3 style="font-size:16px; margin-bottom:4px;">Calendario Oficial & Fixture de Torneos</h3>
      <p style="font-size:11.5px; color:#94A3B8; margin-bottom:8px;">Programación y logística de torneos, amistosos y copas regionales.</p>
      <ul class="module-feature-list">
        <li><span class="check-icon">✔</span><div><strong>Ruta GPS a la Cancha:</strong> Enlace directo a Google Maps / Waze para evitar retrasos.</div></li>
        <li><span class="check-icon">✔</span><div><strong>Información del Rival & Sede:</strong> Horarios de llegada, calentamiento y charla técnica.</div></li>
        <li><span class="check-icon">✔</span><div><strong>Historial de Resultados:</strong> Estadísticas de partidos ganados, empatados y perdidos.</div></li>
        <li><span class="check-icon">✔</span><div><strong>Presupuesto de Juzgamiento:</strong> Registro de costos de arbitraje y alquiler de cancha.</div></li>
      </ul>
    </div>
    <div class="phone-mockup">
      <img src="{shots['partidos']}" alt="Partidos Mockup">
    </div>
  </div>

  <!-- Module 4 -->
  <div class="module-container">
    <div>
      <span class="badge badge-emerald" style="margin-bottom:6px;">MÓDULO 04</span>
      <h3 style="font-size:16px; margin-bottom:4px;">Convocatorias Inteligentes & Pizarra</h3>
      <p style="font-size:11.5px; color:#94A3B8; margin-bottom:8px;">Selección del plantel, alineación titular vs suplentes y confirmación de acudientes.</p>
      <ul class="module-feature-list">
        <li><span class="check-icon">✔</span><div><strong>Alineación Titular vs Suplentes:</strong> Asignación clara de dorsales y posiciones.</div></li>
        <li><span class="check-icon">✔</span><div><strong>Confirmación en 1 Clic:</strong> El padre confirma la asistencia del menor al instante.</div></li>
        <li><span class="check-icon">✔</span><div><strong>Semáforo de Pagos:</strong> Advierte al DT si el convocado tiene mensualidades atrasadas.</div></li>
        <li><span class="check-icon">✔</span><div><strong>Póster con Inteligencia Artificial:</strong> Generación de artes para redes sociales.</div></li>
      </ul>
    </div>
    <div class="phone-mockup">
      <img src="{shots['convocatorias']}" alt="Convocatorias Mockup">
    </div>
  </div>

  <div class="page-footer">
    <span>SportCoreOS · Dossier Comercial & Portafolio 2026</span>
    <span>Página 05</span>
  </div>
</div>


<!-- ======================================================================= -->
<!-- PÁGINA 6: MÓDULOS 5 Y 6 (CANCHAS & BOLETÍN IA)                         -->
<!-- ======================================================================= -->
<div class="page">
  <div class="page-header">
    <div>
      <div class="page-header-sub">CATÁLOGO DE MÓDULOS · MÓDULOS 05 & 06</div>
      <div class="page-header-title">Alquiler de Canchas & Boletín Deportivo IA</div>
    </div>
    <span class="badge badge-violet">INNOVACIÓN & MONETIZACIÓN</span>
  </div>

  <!-- Module 5 -->
  <div class="module-container">
    <div>
      <span class="badge badge-cyan" style="margin-bottom:6px;">MÓDULO 05</span>
      <h3 style="font-size:16px; margin-bottom:4px;">Alquiler de Canchas & Escenarios</h3>
      <p style="font-size:11.5px; color:#94A3B8; margin-bottom:8px;">Monetice las horas libres de sus canchas sintéticas o naturales a terceros.</p>
      <ul class="module-feature-list">
        <li><span class="check-icon">✔</span><div><strong>Disponibilidad en Vivo:</strong> Visualización por horas para evitar solapamientos.</div></li>
        <li><span class="check-icon">✔</span><div><strong>Tarifas Día / Noche:</strong> Precios diferenciados por iluminación y fin de semana.</div></li>
        <li><span class="check-icon">✔</span><div><strong>Anticipos y Reservas Web:</strong> Pagos de garantía en línea para asegurar el turno.</div></li>
        <li><span class="check-icon">✔</span><div><strong>Servicios Extra:</strong> Cobro adicional de petos, balones oficiales y árbitro.</div></li>
      </ul>
    </div>
    <div class="phone-mockup">
      <img src="{shots['canchas']}" alt="Canchas Mockup">
    </div>
  </div>

  <!-- Module 6 -->
  <div class="module-container">
    <div>
      <span class="badge badge-violet" style="margin-bottom:6px;">MÓDULO 06</span>
      <h3 style="font-size:16px; margin-bottom:4px;">Boletín de Rendimiento con IA (Gemini)</h3>
      <p style="font-size:11.5px; color:#94A3B8; margin-bottom:8px;">Informes técnicos semestrales que fidelizan a los acudientes y valorizan la cuota.</p>
      <ul class="module-feature-list">
        <li><span class="check-icon">✔</span><div><strong>Síntesis Inteligente:</strong> La IA cruza asistencia, tests y observaciones del DT.</div></li>
        <li><span class="check-icon">✔</span><div><strong>Evaluación en 4 Ejes:</strong> Técnica, Táctica, Condición Física y Disciplina.</div></li>
        <li><span class="check-icon">✔</span><div><strong>Planes de Mejora en Casa:</strong> Ejercicios personalizados para pulir debilidades.</div></li>
        <li><span class="check-icon">✔</span><div><strong>PDF Premium con Escudo:</strong> Entrega formal semestral para los padres de familia.</div></li>
      </ul>
    </div>
    <div class="phone-mockup">
      <img src="{shots['boletin_ia']}" alt="Boletín IA Mockup">
    </div>
  </div>

  <div class="page-footer">
    <span>SportCoreOS · Dossier Comercial & Portafolio 2026</span>
    <span>Página 06</span>
  </div>
</div>


<!-- ======================================================================= -->
<!-- PÁGINA 7: MÓDULOS 7 Y 8 (CARNET DIGITAL & TIENDA DORSALES)              -->
<!-- ======================================================================= -->
<div class="page">
  <div class="page-header">
    <div>
      <div class="page-header-sub">CATÁLOGO DE MÓDULOS · MÓDULOS 07 & 08</div>
      <div class="page-header-title">Carnet Digital QR & Tienda Oficial del Club</div>
    </div>
    <span class="badge badge-emerald">IDENTIDAD & COMERCIO</span>
  </div>

  <!-- Module 7 -->
  <div class="module-container">
    <div>
      <span class="badge badge-gold" style="margin-bottom:6px;">MÓDULO 07</span>
      <h3 style="font-size:16px; margin-bottom:4px;">Carnet Digital del Jugador & QR</h3>
      <p style="font-size:11.5px; color:#94A3B8; margin-bottom:8px;">Acreditación oficial anti-suplantación en el teléfono inteligente del acudiente.</p>
      <ul class="module-feature-list">
        <li><span class="check-icon">✔</span><div><strong>Credencial Oficial en el Móvil:</strong> Foto, categoría, dorsal, EPS y grupo sanguíneo.</div></li>
        <li><span class="check-icon">✔</span><div><strong>Código QR Anti-Suplantación:</strong> Validación rápida por árbitros y veedores de torneo.</div></li>
        <li><span class="check-icon">✔</span><div><strong>Ficha Médica de Emergencia:</strong> Póliza de seguro y contactos de acudientes.</div></li>
        <li><span class="check-icon">✔</span><div><strong>Cero Gasto de Plastificación:</strong> Elimina carnets plásticos que se pierden.</div></li>
      </ul>
    </div>
    <div class="phone-mockup">
      <img src="{shots['carnet']}" alt="Carnet Mockup">
    </div>
  </div>

  <!-- Module 8 -->
  <div class="module-container">
    <div>
      <span class="badge badge-emerald" style="margin-bottom:6px;">MÓDULO 08</span>
      <h3 style="font-size:16px; margin-bottom:4px;">Tienda Oficial & Matriz de Dorsales</h3>
      <p style="font-size:11.5px; color:#94A3B8; margin-bottom:8px;">Gestión de indumentaria deportiva y tienda online de kits oficiales del club.</p>
      <ul class="module-feature-list">
        <li><span class="check-icon">✔</span><div><strong>Matriz de Dorsales Únicos:</strong> Evite camisetas repetidas en planillas de torneo.</div></li>
        <li><span class="check-icon">✔</span><div><strong>Venta de Kits y Accesorios:</strong> Uniformes de juego, buzos, morrales y termos.</div></li>
        <li><span class="check-icon">✔</span><div><strong>Control de Stock por Tallas:</strong> Inventario en tiempo real para reposición oportuna.</div></li>
        <li><span class="check-icon">✔</span><div><strong>Pedidos y Pagos Directos:</strong> Los padres compran desde la app sin filas.</div></li>
      </ul>
    </div>
    <div class="phone-mockup">
      <img src="{shots['tienda']}" alt="Tienda Mockup">
    </div>
  </div>

  <div class="page-footer">
    <span>SportCoreOS · Dossier Comercial & Portafolio 2026</span>
    <span>Página 07</span>
  </div>
</div>


<!-- ======================================================================= -->
<!-- PÁGINA 8: PLANES COMERCIALES & RETORNO DE INVERSIÓN (ROI)               -->
<!-- ======================================================================= -->
<div class="page">
  <div class="page-header">
    <div>
      <div class="page-header-sub">MODELO SAAS & RETORNO DE INVERSIÓN</div>
      <div class="page-header-title">Planes Comerciales Diseñados para Crecer</div>
    </div>
    <span class="badge badge-gold">INVERSIÓN RENTABLE</span>
  </div>

  <p style="color:#CBD5E1; font-size:12px; margin-bottom:12px;">
    Nuestros planes SaaS están diseñados según el volumen de deportistas activos de su academia, garantizando que el costo de la plataforma se pague solo con la recuperación de tan solo <strong>1 o 2 mensualidades morosas</strong>.
  </p>

  <table class="pricing-table">
    <thead>
      <tr>
        <th>Característica / Módulo</th>
        <th style="color:#F59E0B;">🌱 Semillero</th>
        <th style="color:#10B981;">⭐ Academia Pro (Recomendado)</th>
        <th style="color:#06B6D4;">🏆 Club Élite</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Límite de Jugadores Activos</strong></td>
        <td>Hasta 60 alumnos</td>
        <td>Hasta 180 alumnos</td>
        <td><strong>Ilimitados</strong></td>
      </tr>
      <tr>
        <td><strong>Categorías Deportivas</strong></td>
        <td>Hasta 4 categorías</td>
        <td>Hasta 10 categorías</td>
        <td><strong>Ilimitadas</strong></td>
      </tr>
      <tr>
        <td><strong>Usuarios Entrenadores / Staff</strong></td>
        <td>3 Entrenadores</td>
        <td>8 Entrenadores</td>
        <td><strong>Ilimitados</strong></td>
      </tr>
      <tr>
        <td><strong>Ficha Deportiva & Biometría</strong></td>
        <td>Básica (Peso/Talla)</td>
        <td>Completa + Tests Físicos</td>
        <td>Completa + Radar + Scouting</td>
      </tr>
      <tr>
        <td><strong>Convocatorias & Partidos</strong></td>
        <td>✔ Incluido</td>
        <td>✔ Incluido</td>
        <td>✔ Incluido + SMS</td>
      </tr>
      <tr>
        <td><strong>Cobranza PSE / Tarjetas / Wompi</strong></td>
        <td>✔ Incluido</td>
        <td>✔ Incluido</td>
        <td>✔ Incluido (Tasa VIP)</td>
      </tr>
      <tr>
        <td><strong>Matriz de Dorsales & Tienda Oficial</strong></td>
        <td>❌ No incluido</td>
        <td>✔ Incluido</td>
        <td>✔ Incluido</td>
      </tr>
      <tr>
        <td><strong>Boletines con Inteligencia Artificial</strong></td>
        <td>❌ No incluido</td>
        <td>✔ Incluido</td>
        <td>✔ Incluido</td>
      </tr>
      <tr>
        <td><strong>Módulo de Alquiler de Canchas</strong></td>
        <td>➕ Opcional</td>
        <td>➕ Opcional</td>
        <td>✔ <strong>Totalmente Incluido</strong></td>
      </tr>
      <tr>
        <td><strong>Dominio Web Propio Exclusivo</strong></td>
        <td>Subdominio SportCore</td>
        <td>Subdominio SportCore</td>
        <td>✔ <strong>Dominio Propio (ej. miclub.com)</strong></td>
      </tr>
      <tr>
        <td><strong>PRECIO MENSUAL (COP)</strong></td>
        <td style="font-weight:800; color:#F8FAFC;">$89.000 COP</td>
        <td style="font-weight:800; color:#10B981; font-size:13px;">$189.000 COP</td>
        <td style="font-weight:800; color:#06B6D4;">$349.000 COP</td>
      </tr>
      <tr>
        <td><strong>PRECIO ANUAL (Ahorra 2 Meses)</strong></td>
        <td>$890.000 COP/año</td>
        <td>$1.890.000 COP/año</td>
        <td>$3.490.000 COP/año</td>
      </tr>
      <tr>
        <td><strong>PRECIO INTERNACIONAL (USD)</strong></td>
        <td>$25 USD / mes</td>
        <td>$49 USD / mes</td>
        <td>$89 USD / mes</td>
      </tr>
    </tbody>
  </table>

  <div class="grid-2" style="margin-top:16px;">
    <div class="card" style="border-color:#10B981; background:rgba(16, 185, 129, 0.08);">
      <div style="font-size:13px; font-weight:800; color:#10B981; margin-bottom:4px;">🎁 Beneficios Incluidos en Todos los Planes</div>
      <ul style="list-style:none; font-size:11px; color:#CBD5E1;">
        <li>✔ Migración gratuita del censo de alumnos desde su archivo de Excel.</li>
        <li>✔ Capacitación guiada para el personal administrativo y entrenadores.</li>
        <li>✔ Soporte técnico por WhatsApp directo durante toda la vigencia.</li>
      </ul>
    </div>

    <div class="card" style="border-color:#F59E0B; background:rgba(245, 158, 11, 0.08);">
      <div style="font-size:13px; font-weight:800; color:#F59E0B; margin-bottom:4px;">⚡ Garantía de Prueba Gratuita por 14 Días</div>
      <p style="font-size:11px; color:#CBD5E1;">
        Pruebe SportCoreOS en su escuela deportiva sin riesgo. Si en las dos primeras semanas no comprueba el orden y el ahorro administrativo, puede cancelar sin penalidad.
      </p>
    </div>
  </div>

  <div class="page-footer">
    <span>SportCoreOS · Dossier Comercial & Portafolio 2026</span>
    <span>Página 08</span>
  </div>
</div>


<!-- ======================================================================= -->
<!-- PÁGINA 9: DESPLIEGUE EN 48 HORAS & CONTACTO COMERCIAL                  -->
<!-- ======================================================================= -->
<div class="page">
  <div class="glow-top-right"></div>

  <div class="page-header">
    <div>
      <div class="page-header-sub">ONBOARDING ÁGIL & CONTACTO</div>
      <div class="page-header-title">Comience a Operar como un Club Profesional</div>
    </div>
    <span class="badge badge-emerald">DESPLIEGUE EN 48 HORAS</span>
  </div>

  <h3 style="font-size:16px; margin-bottom:12px; color:#F8FAFC;">Plan de Despliegue Express en 3 Pasos Sencillos:</h3>

  <div class="grid-3" style="margin-bottom:20px;">
    <div class="card" style="border-top:3px solid #F59E0B;">
      <div style="font-size:13px; font-weight:800; color:#F59E0B; margin-bottom:4px;">PASO 1: MIGRACIÓN</div>
      <div style="font-size:11px; color:#CBD5E1;">
        Nos entrega su listado de deportistas y categorías en Excel. Nuestro equipo técnico carga y estructura la información en menos de 24 horas.
      </div>
    </div>

    <div class="card" style="border-top:3px solid #06B6D4;">
      <div style="font-size:13px; font-weight:800; color:#06B6D4; margin-bottom:4px;">PASO 2: CAPACITACIÓN</div>
      <div style="font-size:11px; color:#CBD5E1;">
        Taller práctico en vivo de 45 minutos para sus entrenadores y directores sobre uso de convocatorias, asistencia y cobros en línea.
      </div>
    </div>

    <div class="card" style="border-top:3px solid #10B981;">
      <div style="font-size:13px; font-weight:800; color:#10B981; margin-bottom:4px;">PASO 3: LANZAMIENTO</div>
      <div style="font-size:11px; color:#CBD5E1;">
        Envío masivo de accesos a los padres de familia con un video instructivo personalizado para empezar a pagar y confirmar citaciones.
      </div>
    </div>
  </div>

  <!-- Contact Big Card -->
  <div class="card" style="background:#111827; border:2px solid #10B981; padding:24px; margin-bottom:20px;">
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
      <div>
        <h2 style="font-size:22px; color:#F8FAFC; margin-bottom:4px;">Agende su Demostración en Vivo</h2>
        <p style="font-size:12.5px; color:#94A3B8;">Conozca cómo SportCoreOS puede transformar su academia en una llamada de 15 minutos.</p>
      </div>
      <span class="badge badge-emerald">ATENCIÓN INMEDIATA</span>
    </div>

    <div class="grid-2" style="margin-top:10px;">
      <div>
        <div style="font-size:12px; color:#94A3B8; margin-bottom:2px;">📱 Línea Directa & WhatsApp Comercial:</div>
        <div style="font-size:15px; font-weight:800; color:#10B981; margin-bottom:10px;">+57 311 705 1171</div>

        <div style="font-size:12px; color:#94A3B8; margin-bottom:2px;">📧 Correo Electrónico Corporativo:</div>
        <div style="font-size:14px; font-weight:700; color:#F8FAFC; margin-bottom:10px;">anroswell@gmail.com</div>

        <div style="font-size:12px; color:#94A3B8; margin-bottom:2px;">📍 Sede Comercial:</div>
        <div style="font-size:13px; color:#CBD5E1;">Cartagena de Indias, Colombia (Servicio para toda Latinoamérica)</div>
      </div>

      <div>
        <div style="font-size:12px; color:#94A3B8; margin-bottom:2px;">🌐 Plataforma & Demo en Línea:</div>
        <div style="font-size:14px; font-weight:700; color:#06B6D4; margin-bottom:10px;">https://sportcore.site</div>

        <div style="font-size:12px; color:#94A3B8; margin-bottom:2px;">🏢 Desarrollado y Respaldado por:</div>
        <div style="font-size:14px; font-weight:800; color:#F8FAFC; margin-bottom:4px;">SECTIC / SECTICSOLAR S.A.S.</div>
        <div style="font-size:11px; color:#94A3B8;">Líderes en desarrollo de ecosistemas SaaS, automatización y software de alta disponibilidad.</div>
      </div>
    </div>
  </div>

  <div style="text-align:center; font-size:12px; color:#94A3B8;">
    © 2026 SportCoreOS · Todos los derechos reservados · Desarrollado por SECTIC S.A.S.
  </div>

  <div class="page-footer">
    <span>SportCoreOS · Dossier Comercial & Portafolio 2026</span>
    <span>Página 09</span>
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
