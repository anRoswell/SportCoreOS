import base64
import os
import subprocess

branding_dir = "/Users/sectic/Documents/Codigos Fuentes/SportCoreOS/branding"
output_html = "/Users/sectic/Documents/Codigos Fuentes/SportCoreOS/portafolio_temp.html"
output_pdf = "/Users/sectic/Documents/Codigos Fuentes/SportCoreOS/PORTAFOLIO_DE_SERVICIOS_SPORTCOREOS_SECTIC.pdf"

def get_b64(filename):
    path = os.path.join(branding_dir, filename)
    if os.path.exists(path):
        with open(path, "rb") as f:
            data = f.read()
            ext = filename.split(".")[-1]
            mime = "image/jpeg" if ext in ["jpg", "jpeg"] else "image/svg+xml" if ext == "svg" else "image/png"
            return f"data:{mime};base64,{base64.b64encode(data).decode('utf-8')}"
    return ""

logo_b64 = get_b64("sportcore_logo.jpg")
banner_b64 = get_b64("sportcore_marketing_banner.jpg")
mobile_icon_b64 = get_b64("sportcore_mobile_icon.jpg")
splash_b64 = get_b64("sportcore_splashscreen.jpg")
social_b64 = get_b64("sportcore_social_post.jpg")

html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Portafolio de Servicios SportCoreOS — SECTIC S.A.S.</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  
  <style>
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
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #070b14;
      color: #f1f5f9;
      margin: 0;
      padding: 0;
    }}

    .page {{
      width: 210mm;
      height: 297mm;
      min-height: 297mm;
      max-height: 297mm;
      position: relative;
      overflow: hidden;
      page-break-after: always;
      page-break-inside: avoid;
      background: #0b0f19;
      display: flex;
      flex-direction: column;
      padding: 16mm 18mm 14mm 18mm;
    }}

    /* Ambient Glows */
    .glow-sphere {{
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      pointer-events: none;
      z-index: 0;
    }}

    .glow-emerald {{
      background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%);
    }}

    .glow-cyan {{
      background: radial-gradient(circle, rgba(6, 182, 212, 0.22) 0%, transparent 70%);
    }}

    .glow-gold {{
      background: radial-gradient(circle, rgba(245, 158, 11, 0.20) 0%, transparent 70%);
    }}

    /* Grid overlay */
    .pitch-grid {{
      position: absolute;
      inset: 0;
      background-image: 
        radial-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
        linear-gradient(to right, rgba(16, 185, 129, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
      background-size: 20mm 20mm, 40mm 40mm, 40mm 40mm;
      opacity: 0.6;
      pointer-events: none;
      z-index: 0;
    }}

    .content-layer {{
      position: relative;
      z-index: 10;
      height: 100%;
      display: flex;
      flex-direction: column;
    }}

    /* Header & Footer Components */
    .page-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 3.5mm;
      border-bottom: 1px solid rgba(16, 185, 129, 0.25);
      margin-bottom: 5mm;
    }}

    .header-logo-group {{
      display: flex;
      align-items: center;
      gap: 3mm;
    }}

    .header-logo-img {{
      width: 10mm;
      height: 10mm;
      border-radius: 2.5mm;
      border: 1px solid rgba(16, 185, 129, 0.4);
    }}

    .header-titles h1 {{
      font-size: 13pt;
      font-weight: 900;
      letter-spacing: -0.02em;
      color: #ffffff;
      line-height: 1.1;
    }}

    .header-titles span {{
      font-size: 7pt;
      font-weight: 700;
      color: #10b981;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }}

    .header-badge {{
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 1.5mm 3.5mm;
      border-radius: 20px;
      font-size: 7pt;
      font-weight: 700;
      color: #34d399;
      display: flex;
      align-items: center;
      gap: 1.5mm;
    }}

    .page-footer {{
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 3.5mm;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 7pt;
      color: #94a3b8;
    }}

    .footer-brand {{
      display: flex;
      align-items: center;
      gap: 2mm;
      font-weight: 600;
    }}

    .footer-page-num {{
      font-weight: 800;
      color: #10b981;
      font-family: 'JetBrains Mono', monospace;
    }}

    /* Card System */
    .card {{
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 4mm;
      padding: 4mm 5mm;
      backdrop-filter: blur(10px);
    }}

    .card-highlight {{
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%);
      border: 1px solid rgba(16, 185, 129, 0.35);
    }}

    /* Typography */
    .section-title {{
      font-size: 16pt;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.02em;
      margin-bottom: 1.5mm;
      display: flex;
      align-items: center;
      gap: 2.5mm;
    }}

    .section-title i {{
      color: #10b981;
      font-size: 14pt;
    }}

    .section-subtitle {{
      font-size: 8.5pt;
      color: #94a3b8;
      line-height: 1.4;
      margin-bottom: 4.5mm;
    }}

    .gradient-text {{
      background: linear-gradient(135deg, #34d399 0%, #06b6d4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }}

    .gradient-gold {{
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }}

    /* Grid Layouts */
    .grid-2col {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3.5mm;
    }}

    .grid-3col {{
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 3.5mm;
    }}

    .grid-4col {{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 3mm;
    }}

    /* =========================================================================
       PAGE 1: COVER
       ========================================================================= */
    .cover-page {{
      padding: 0;
      background: linear-gradient(170deg, #070b14 0%, #091224 45%, #04241d 100%);
      justify-content: space-between;
    }}

    .cover-top-bar {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14mm 18mm 0 18mm;
      z-index: 10;
    }}

    .sectic-brand {{
      display: flex;
      align-items: center;
      gap: 3mm;
    }}

    .sectic-badge-box {{
      width: 10mm;
      height: 10mm;
      background: #10b981;
      border-radius: 2.5mm;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 14pt;
      color: #0b0f19;
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
    }}

    .sectic-text {{
      display: flex;
      flex-direction: column;
    }}

    .sectic-text .name {{
      font-size: 13pt;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: 0.05em;
    }}

    .sectic-text .sub {{
      font-size: 6.5pt;
      color: #94a3b8;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-weight: 700;
    }}

    .cover-hero-visual {{
      position: relative;
      width: 100%;
      height: 105mm;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5;
    }}

    .cover-hero-img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.9;
      mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
      -webkit-mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
    }}

    .cover-content {{
      padding: 0 18mm 16mm 18mm;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 4mm;
    }}

    .cover-tag {{
      display: inline-flex;
      align-items: center;
      gap: 2mm;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      padding: 1.8mm 4mm;
      border-radius: 20px;
      font-size: 8pt;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #34d399;
      width: fit-content;
    }}

    .cover-title {{
      font-size: 26pt;
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -0.03em;
      color: #ffffff;
    }}

    .cover-subtitle {{
      font-size: 10pt;
      color: #cbd5e1;
      line-height: 1.45;
      max-width: 165mm;
    }}

    .cover-badges-row {{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2.5mm;
      margin-top: 2mm;
    }}

    .cover-badge-card {{
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(16, 185, 129, 0.25);
      padding: 2.5mm 3mm;
      border-radius: 2.5mm;
      display: flex;
      flex-direction: column;
      gap: 0.5mm;
    }}

    .cover-badge-card .b-val {{
      font-size: 11pt;
      font-weight: 900;
      color: #34d399;
      font-family: 'JetBrains Mono', monospace;
    }}

    .cover-badge-card .b-lbl {{
      font-size: 6.5pt;
      color: #94a3b8;
      font-weight: 600;
    }}

    .cover-footer {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 4mm;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      font-size: 7.5pt;
      color: #94a3b8;
    }}

    /* =========================================================================
       PAGE 2: WHO WE ARE & THE PAIN POINTS
       ========================================================================= */
    .feature-item-box {{
      display: flex;
      gap: 3mm;
      padding: 3mm;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 3mm;
    }}

    .feature-item-box .f-icon {{
      width: 9mm;
      height: 9mm;
      border-radius: 2.5mm;
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11pt;
      flex-shrink: 0;
    }}

    .feature-item-box .f-text h4 {{
      font-size: 8.5pt;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 0.8mm;
    }}

    .feature-item-box .f-text p {{
      font-size: 7pt;
      color: #94a3b8;
      line-height: 1.35;
    }}

    .pain-card {{
      background: rgba(239, 68, 68, 0.06);
      border: 1px solid rgba(239, 68, 68, 0.25);
      border-radius: 3mm;
      padding: 3mm 3.5mm;
      display: flex;
      gap: 2.5mm;
    }}

    .pain-card .p-icon {{
      color: #ef4444;
      font-size: 11pt;
      padding-top: 0.5mm;
    }}

    .pain-card h5 {{
      font-size: 8pt;
      font-weight: 800;
      color: #fca5a5;
      margin-bottom: 0.5mm;
    }}

    .pain-card p {{
      font-size: 6.8pt;
      color: #cbd5e1;
      line-height: 1.3;
    }}

    /* =========================================================================
       PAGE 3: 6 PILLARS / MODULES
       ========================================================================= */
    .pillar-card {{
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(16, 185, 129, 0.22);
      border-radius: 3.5mm;
      padding: 3.5mm 4mm;
      display: flex;
      flex-direction: column;
      gap: 1.5mm;
      position: relative;
    }}

    .pillar-header {{
      display: flex;
      align-items: center;
      gap: 2.5mm;
    }}

    .pillar-icon-wrap {{
      width: 8mm;
      height: 8mm;
      border-radius: 2mm;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(6, 182, 212, 0.2) 100%);
      color: #34d399;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10pt;
      flex-shrink: 0;
    }}

    .pillar-title {{
      font-size: 9pt;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.15;
    }}

    .pillar-desc {{
      font-size: 6.8pt;
      color: #94a3b8;
      line-height: 1.35;
    }}

    .pillar-tags {{
      display: flex;
      gap: 1.5mm;
      flex-wrap: wrap;
      margin-top: 1mm;
    }}

    .pillar-tag {{
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 0.8mm 2mm;
      border-radius: 1.5mm;
      font-size: 5.8pt;
      color: #cbd5e1;
      font-weight: 600;
    }}

    /* =========================================================================
       PAGE 4: PRICING & ROI
       ========================================================================= */
    .plan-card {{
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 4mm;
      padding: 4mm 4.5mm;
      display: flex;
      flex-direction: column;
      position: relative;
    }}

    .plan-card.popular {{
      background: linear-gradient(175deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%);
      border: 1.5px solid #10b981;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.15);
    }}

    .popular-tag {{
      position: absolute;
      top: -2.5mm;
      right: 4mm;
      background: #10b981;
      color: #0b0f19;
      font-size: 5.5pt;
      font-weight: 900;
      padding: 0.8mm 2.5mm;
      border-radius: 20px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }}

    .plan-name {{
      font-size: 11pt;
      font-weight: 900;
      color: #ffffff;
      margin-bottom: 0.5mm;
    }}

    .plan-cap {{
      font-size: 7pt;
      color: #34d399;
      font-weight: 700;
      margin-bottom: 2mm;
    }}

    .plan-price-box {{
      padding: 2mm 0;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 2.5mm;
    }}

    .plan-price {{
      font-size: 14pt;
      font-weight: 900;
      color: #ffffff;
      font-family: 'JetBrains Mono', monospace;
    }}

    .plan-period {{
      font-size: 6.5pt;
      color: #94a3b8;
    }}

    .plan-features {{
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 1.3mm;
      font-size: 6.6pt;
      color: #cbd5e1;
    }}

    .plan-features li {{
      display: flex;
      align-items: center;
      gap: 1.8mm;
    }}

    .plan-features li i {{
      color: #10b981;
      font-size: 6.5pt;
    }}

    .roi-stat-box {{
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 3mm;
      padding: 2.5mm 3.5mm;
      display: flex;
      flex-direction: column;
      gap: 0.5mm;
      text-align: center;
    }}

    .roi-stat-num {{
      font-size: 14pt;
      font-weight: 900;
      color: #34d399;
      font-family: 'JetBrains Mono', monospace;
    }}

    .roi-stat-lbl {{
      font-size: 6.5pt;
      color: #cbd5e1;
      font-weight: 600;
    }}

    /* =========================================================================
       PAGE 5: IMPLEMENTATION & CONTACT
       ========================================================================= */
    .step-card {{
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 3mm;
      padding: 3mm;
      display: flex;
      gap: 2.5mm;
      align-items: flex-start;
    }}

    .step-num {{
      width: 7mm;
      height: 7mm;
      border-radius: 50%;
      background: #10b981;
      color: #0b0f19;
      font-size: 8pt;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }}

    .contact-box {{
      background: linear-gradient(145deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%);
      border: 1.5px solid rgba(16, 185, 129, 0.4);
      border-radius: 4mm;
      padding: 5mm 6mm;
      display: flex;
      flex-direction: column;
      gap: 3mm;
    }}

    .contact-row {{
      display: flex;
      align-items: center;
      gap: 3mm;
      font-size: 8pt;
      color: #e2e8f0;
    }}

    .contact-icon {{
      width: 7mm;
      height: 7mm;
      border-radius: 2mm;
      background: rgba(16, 185, 129, 0.25);
      color: #34d399;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8pt;
      flex-shrink: 0;
    }}
  </style>
</head>
<body>

  <!-- =======================================================================
       PÁGINA 1: PORTADA EJECUTIVA
       ======================================================================= -->
  <div class="page cover-page">
    <div class="pitch-grid"></div>
    <div class="glow-sphere glow-emerald" style="top: -20mm; right: -20mm; width: 120mm; height: 120mm;"></div>
    <div class="glow-sphere glow-cyan" style="bottom: 10mm; left: -20mm; width: 110mm; height: 110mm;"></div>

    <!-- Header Top -->
    <div class="cover-top-bar">
      <div class="sectic-brand">
        <div class="sectic-badge-box">S</div>
        <div class="sectic-text">
          <span class="name">SECTIC S.A.S.</span>
          <span class="sub">Servicios &amp; Soluciones Tecnológicas</span>
        </div>
      </div>
      <div class="header-badge">
        <i class="fa-solid fa-shield-halved"></i>
        <span>SaaS Deportivo Certificado 2026</span>
      </div>
    </div>

    <!-- Hero Image Layer -->
    <div class="cover-hero-visual">
      <img src="{banner_b64}" class="cover-hero-img" alt="SportCoreOS Hero Visual">
    </div>

    <!-- Cover Main Content -->
    <div class="cover-content">
      <div class="cover-tag">
        <i class="fa-solid fa-futbol"></i>
        <span>PORTAFOLIO DE SOLUCIONES TECNOLÓGICAS</span>
      </div>

      <h1 class="cover-title">
        SportCore<span class="gradient-text">OS</span>
      </h1>
      
      <p style="font-size: 13pt; font-weight: 800; color: #34d399; letter-spacing: -0.01em; margin-top: -2mm;">
        Athletic Performance Cloud • Sistema Operativo para Academias de Fútbol
      </p>

      <p class="cover-subtitle">
        La plataforma integral en la nube desarrollada por <strong>SECTIC S.A.S.</strong> que automatiza la cobranza de pensiones por PSE/Wompi, organiza convocatorias por WhatsApp en un toque, gestiona expedientes biométricos 360° y visualiza telemetría para proyectar futuras estrellas.
      </p>

      <!-- Metric Highlights -->
      <div class="cover-badges-row">
        <div class="cover-badge-card">
          <span class="b-val">&gt; 98.6%</span>
          <span class="b-lbl">Tasa Recaudo Cartera</span>
        </div>
        <div class="cover-badge-card">
          <span class="b-val">- 15h</span>
          <span class="b-lbl">Ahorro Semanal Staff</span>
        </div>
        <div class="cover-badge-card">
          <span class="b-val">Sub-7 &rarr; 20</span>
          <span class="b-lbl">Control de Dorsales</span>
        </div>
        <div class="cover-badge-card">
          <span class="b-val">100% Cloud</span>
          <span class="b-lbl">Web + Mobile First</span>
        </div>
      </div>

      <div class="cover-footer">
        <span>© 2026 SECTIC S.A.S. • NIT 901.XXX.XXX-X • Colombia</span>
        <span style="font-weight: 700; color: #34d399;">sportcoreos.sectic.com</span>
      </div>
    </div>
  </div>


  <!-- =======================================================================
       PÁGINA 2: QUIÉNES SOMOS & LOS DESAFÍOS DEL FÚTBOL FORMADO
       ======================================================================= -->
  <div class="page">
    <div class="pitch-grid"></div>
    <div class="glow-sphere glow-emerald" style="top: 10mm; right: -10mm; width: 90mm; height: 90mm;"></div>

    <div class="content-layer">
      <div class="page-header">
        <div class="header-logo-group">
          <img src="{logo_b64}" class="header-logo-img" alt="Logo">
          <div class="header-titles">
            <h1>SECTIC S.A.S. &amp; SportCoreOS</h1>
            <span>Ingeniería de Software &amp; Soluciones Cloud</span>
          </div>
        </div>
        <div class="header-badge">
          <i class="fa-solid fa-circle-check"></i>
          <span>Propuesta de Valor</span>
        </div>
      </div>

      <h2 class="section-title">
        <i class="fa-solid fa-lightbulb"></i>
        <span>Transformación Digital para el Deporte Formativo</span>
      </h2>
      <p class="section-subtitle">
        En <strong>SECTIC S.A.S.</strong> diseñamos arquitectura tecnológica de alto impacto. Creamos <strong>SportCoreOS</strong> tras identificar las fallas operativas y financieras que limitan el crecimiento de las escuelas y clubes deportivos en Colombia y América Latina.
      </p>

      <!-- Problem vs Solution 2-Col Grid -->
      <div class="grid-2col" style="margin-bottom: 4mm;">
        <!-- Left: The Reality / Pains -->
        <div style="display: flex; flex-direction: column; gap: 2.5mm;">
          <h3 style="font-size: 10pt; font-weight: 800; color: #fca5a5; display: flex; align-items: center; gap: 2mm;">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>La Realidad Actual de las Academias</span>
          </h3>

          <div class="pain-card">
            <i class="fa-solid fa-circle-xmark p-icon"></i>
            <div>
              <h5>30% a 40% de Morosidad en Pensiones</h5>
              <p>Cobranza manual en efectivo o transferencias no identificadas que provocan fuga de ingresos y descontrol contable.</p>
            </div>
          </div>

          <div class="pain-card">
            <i class="fa-solid fa-circle-xmark p-icon"></i>
            <div>
              <h5>Caos en Convocatorias por WhatsApp</h5>
              <p>Grupos masivos desordenados, padres que no confirman asistencia a tiempo y partidos jugados con alineaciones incompletas.</p>
            </div>
          </div>

          <div class="pain-card">
            <i class="fa-solid fa-circle-xmark p-icon"></i>
            <div>
              <h5>Pérdida de Historial Biométrico</h5>
              <p>Fichas médicas en papel que se extravían, sin registro de tests físicos ni métricas para proyectar talentos ante visores.</p>
            </div>
          </div>

          <div class="pain-card">
            <i class="fa-solid fa-circle-xmark p-icon"></i>
            <div>
              <h5>Dorsales Duplicados &amp; Desorden de Sedes</h5>
              <p>Conflictos en torneos oficiales por numeración repetida y padres desorientados buscando canchas de entrenamiento.</p>
            </div>
          </div>
        </div>

        <!-- Right: The SportCoreOS Solution -->
        <div style="display: flex; flex-direction: column; gap: 2.5mm;">
          <h3 style="font-size: 10pt; font-weight: 800; color: #34d399; display: flex; align-items: center; gap: 2mm;">
            <i class="fa-solid fa-circle-check"></i>
            <span>La Solución Integral SportCoreOS</span>
          </h3>

          <div class="feature-item-box">
            <div class="f-icon"><i class="fa-solid fa-credit-card"></i></div>
            <div class="f-text">
              <h4>Recaudo Fintech PSE / Wompi / Nequi</h4>
              <p>Los padres pagan desde su celular en 30 segundos con conciliación automática y recibos digitales con código QR.</p>
            </div>
          </div>

          <div class="feature-item-box">
            <div class="f-icon"><i class="fa-brands fa-whatsapp"></i></div>
            <div class="f-text">
              <h4>Citaciones Inteligentes en 1 Clic</h4>
              <p>Despacho automatizado a WhatsApp con hora, rival, uniforme, ruta GPS a canchas (Waze/Maps) y botón de asistencia.</p>
            </div>
          </div>

          <div class="feature-item-box">
            <div class="f-icon"><i class="fa-solid fa-chart-line"></i></div>
            <div class="f-text">
              <h4>Expediente Deportivo 360° &amp; Fisiología</h4>
              <p>Antropometría (peso, talla, IMC), velocidad, salto, índice de fatiga ACWR y radar de habilidades FIFA-Style.</p>
            </div>
          </div>

          <div class="feature-item-box">
            <div class="f-icon"><i class="fa-solid fa-shirt"></i></div>
            <div class="f-text">
              <h4>Matriz de Dorsales Sub-7 a Sub-20</h4>
              <p>Asignación visual de camisetas por categoría y rama, garantizando cero dorsales duplicados en torneos.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Trust Quote Card -->
      <div class="card card-highlight" style="margin-top: auto; display: flex; align-items: center; gap: 4mm;">
        <div style="font-size: 24pt; color: #34d399;"><i class="fa-solid fa-quote-left"></i></div>
        <div style="font-size: 7.5pt; color: #e2e8f0; line-height: 1.4;">
          <strong>Compromiso SECTIC S.A.S.:</strong> <em>"No solo entregamos un software; brindamos un ecosistema tecnológico integral con soporte, migración de datos y acompañamiento continuo para elevar la reputación institucional de tu club."</em>
        </div>
      </div>

      <div class="page-footer">
        <div class="footer-brand">
          <i class="fa-solid fa-shield-halved" style="color: #10b981;"></i>
          <span>SECTIC S.A.S. • SportCoreOS v1.0</span>
        </div>
        <span class="footer-page-num">PÁGINA 02</span>
      </div>
    </div>
  </div>


  <!-- =======================================================================
       PÁGINA 3: LOS 6 PILARES FUNCIONALES (MÓDULOS DE ÉLITE)
       ======================================================================= -->
  <div class="page">
    <div class="pitch-grid"></div>
    <div class="glow-sphere glow-cyan" style="bottom: 20mm; right: -10mm; width: 90mm; height: 90mm;"></div>

    <div class="content-layer">
      <div class="page-header">
        <div class="header-logo-group">
          <img src="{mobile_icon_b64}" class="header-logo-img" alt="Icon">
          <div class="header-titles">
            <h1>Módulos &amp; Capacidades de la Plataforma</h1>
            <span>Arquitectura Funcional Deportiva</span>
          </div>
        </div>
        <div class="header-badge">
          <i class="fa-solid fa-cubes"></i>
          <span>6 Módulos Core</span>
        </div>
      </div>

      <h2 class="section-title">
        <i class="fa-solid fa-layer-group"></i>
        <span>Los 6 Pilares Tecnológicos de SportCoreOS</span>
      </h2>
      <p class="section-subtitle">
        Una suite modular, escalable y 100% responsive construida con los estándares más exigentes de la industria SaaS.
      </p>

      <!-- 6 Pillars 2x3 Grid -->
      <div class="grid-2col" style="gap: 3mm;">
        
        <!-- Pillar 1 -->
        <div class="pillar-card">
          <div class="pillar-header">
            <div class="pillar-icon-wrap"><i class="fa-solid fa-wallet"></i></div>
            <div>
              <h3 class="pillar-title">1. Fintech &amp; Recaudo PSE/Wompi</h3>
            </div>
          </div>
          <p class="pillar-desc">
            Motor de facturación recurrente de mensualidades, matrículas, uniformes y torneos. Integrado nativamente con la pasarela bancaria líder en Colombia. Reportes de conciliación y cartera en mora al instante.
          </p>
          <div class="pillar-tags">
            <span class="pillar-tag">PSE</span>
            <span class="pillar-tag">Nequi / Daviplata</span>
            <span class="pillar-tag">Tarjetas Débito/Crédito</span>
            <span class="pillar-tag">Recibos PDF QR</span>
          </div>
        </div>

        <!-- Pillar 2 -->
        <div class="pillar-card">
          <div class="pillar-header">
            <div class="pillar-icon-wrap"><i class="fa-solid fa-bullhorn"></i></div>
            <div>
              <h3 class="pillar-title">2. Convocatorias &amp; Partidos WhatsApp</h3>
            </div>
          </div>
          <p class="pillar-desc">
            Programación de partidos amistosos y de liga. Envío masivo de citaciones personalizadas a acudientes con 1 clic por WhatsApp. Confirmación de asistencia en tiempo real y actas arbitrales digitales.
          </p>
          <div class="pillar-tags">
            <span class="pillar-tag">WhatsApp API 1-Tap</span>
            <span class="pillar-tag">Rutas Waze/Maps</span>
            <span class="pillar-tag">Actas de Goles</span>
            <span class="pillar-tag">Minutos Jugados</span>
          </div>
        </div>

        <!-- Pillar 3 -->
        <div class="pillar-card">
          <div class="pillar-header">
            <div class="pillar-icon-wrap"><i class="fa-solid fa-heart-pulse"></i></div>
            <div>
              <h3 class="pillar-title">3. Expediente 360° &amp; Biometría</h3>
            </div>
          </div>
          <p class="pillar-desc">
            Historial clínico, seguro médico, curvas percentiles antropométricas (peso, talla, IMC) y tests de velocidad/salto. Generación automatizada de boletines de rendimiento técnico semestral para padres.
          </p>
          <div class="pillar-tags">
            <span class="pillar-tag">Test de Cooper</span>
            <span class="pillar-tag">Antropometría</span>
            <span class="pillar-tag">Radar FIFA</span>
            <span class="pillar-tag">Boletín PDF Evaluativo</span>
          </div>
        </div>

        <!-- Pillar 4 -->
        <div class="pillar-card">
          <div class="pillar-header">
            <div class="pillar-icon-wrap"><i class="fa-solid fa-satellite"></i></div>
            <div>
              <h3 class="pillar-title">4. Telemetría GPS &amp; Scouting</h3>
            </div>
          </div>
          <p class="pillar-desc">
            Módulo de analítica táctica para registro de sprints, distancia recorrida, mapas de calor y ratio de carga aguda/crónica (ACWR) para prevención científica de sobrecargas y lesiones musculares.
          </p>
          <div class="pillar-tags">
            <span class="pillar-tag">Mapas de Calor</span>
            <span class="pillar-tag">Prevención ACWR</span>
            <span class="pillar-tag">Ficha Scouting</span>
            <span class="pillar-tag">Exportación Pro</span>
          </div>
        </div>

        <!-- Pillar 5 -->
        <div class="pillar-card">
          <div class="pillar-header">
            <div class="pillar-icon-wrap"><i class="fa-solid fa-map-location-dot"></i></div>
            <div>
              <h3 class="pillar-title">5. Alquiler de Canchas &amp; Tienda</h3>
            </div>
          </div>
          <p class="pillar-desc">
            Monetiza los espacios deportivos de tu sede con un sistema de reservas horarias de canchas sintéticas o naturales. Tienda virtual integrada para venta de indumentaria oficial del club.
          </p>
          <div class="pillar-tags">
            <span class="pillar-tag">Reservas por Hora</span>
            <span class="pillar-tag">Control de Luces</span>
            <span class="pillar-tag">Stock Uniformes</span>
            <span class="pillar-tag">Pagos Online</span>
          </div>
        </div>

        <!-- Pillar 6 -->
        <div class="pillar-card">
          <div class="pillar-header">
            <div class="pillar-icon-wrap"><i class="fa-solid fa-mobile-screen-button"></i></div>
            <div>
              <h3 class="pillar-title">6. App Móvil &amp; Carnet Digital</h3>
            </div>
          </div>
          <p class="pillar-desc">
            Aplicación móvil (iOS, Android y PWA) para padres de familia y cuerpo técnico. Carnet digital con código QR para verificación de identidad y acceso a instalaciones deportivas.
          </p>
          <div class="pillar-tags">
            <span class="pillar-tag">iOS / Android PWA</span>
            <span class="pillar-tag">Carnet QR</span>
            <span class="pillar-tag">Push Notifications</span>
            <span class="pillar-tag">Offline-Ready</span>
          </div>
        </div>

      </div>

      <!-- Tech Stack Footer Banner -->
      <div class="card" style="margin-top: auto; padding: 2.5mm 4mm; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 7pt; color: #94a3b8; font-weight: 600;">Stack de Clase Mundial:</span>
        <div style="display: flex; gap: 3mm; font-size: 7pt; color: #cbd5e1; font-weight: 700;">
          <span><i class="fa-brands fa-angular" style="color: #dd0031;"></i> Angular Signals</span>
          <span><i class="fa-brands fa-node-js" style="color: #22c55e;"></i> NestJS</span>
          <span><i class="fa-solid fa-database" style="color: #3b82f6;"></i> PostgreSQL</span>
          <span><i class="fa-brands fa-aws" style="color: #f59e0b;"></i> Cloud Multi-Tenant</span>
        </div>
      </div>

      <div class="page-footer">
        <div class="footer-brand">
          <i class="fa-solid fa-shield-halved" style="color: #10b981;"></i>
          <span>SECTIC S.A.S. • SportCoreOS v1.0</span>
        </div>
        <span class="footer-page-num">PÁGINA 03</span>
      </div>
    </div>
  </div>


  <!-- =======================================================================
       PÁGINA 4: PLANES COMERCIALES, PRICING & RETORNO DE INVERSIÓN
       ======================================================================= -->
  <div class="page">
    <div class="pitch-grid"></div>
    <div class="glow-sphere glow-emerald" style="top: 20mm; left: -15mm; width: 90mm; height: 90mm;"></div>

    <div class="content-layer">
      <div class="page-header">
        <div class="header-logo-group">
          <img src="{logo_b64}" class="header-logo-img" alt="Logo">
          <div class="header-titles">
            <h1>Planes Comerciales &amp; Retorno de Inversión</h1>
            <span>Propuesta Económica SaaS</span>
          </div>
        </div>
        <div class="header-badge">
          <i class="fa-solid fa-tags"></i>
          <span>Tarifas 2026</span>
        </div>
      </div>

      <h2 class="section-title">
        <i class="fa-solid fa-hand-holding-dollar"></i>
        <span>Inversión Transparente &amp; Altamente Rentable</span>
      </h2>
      <p class="section-subtitle">
        Modelo de suscripción mensual o anual por volumen de alumnos, sin costos ocultos de infraestructura ni servidores.
      </p>

      <!-- 3 Pricing Cards Grid -->
      <div class="grid-3col" style="margin-bottom: 4mm;">
        
        <!-- Plan 1 -->
        <div class="plan-card">
          <h3 class="plan-name">🌱 Semillero</h3>
          <span class="plan-cap">Hasta 60 Jugadores Activos</span>
          <div class="plan-price-box">
            <span class="plan-price">$89.000</span>
            <span class="plan-period">COP / mes ($25 USD)</span>
          </div>
          <ul class="plan-features">
            <li><i class="fa-solid fa-check"></i> Hasta 4 categorías Sub</li>
            <li><i class="fa-solid fa-check"></i> 3 Cuentas Entrenador</li>
            <li><i class="fa-solid fa-check"></i> Recaudo PSE / Wompi</li>
            <li><i class="fa-solid fa-check"></i> Convocatorias WhatsApp</li>
            <li><i class="fa-solid fa-check"></i> Portal Web para Padres</li>
            <li><i class="fa-solid fa-check"></i> Ficha Antropométrica</li>
            <li style="color: #64748b;"><i class="fa-solid fa-xmark" style="color: #64748b;"></i> Sin módulo canchas</li>
          </ul>
        </div>

        <!-- Plan 2 (POPULAR) -->
        <div class="plan-card popular">
          <div class="popular-tag">MÁS ELEGIDO</div>
          <h3 class="plan-name">⭐ Academia Pro</h3>
          <span class="plan-cap">Hasta 180 Jugadores Activos</span>
          <div class="plan-price-box">
            <span class="plan-price">$189.000</span>
            <span class="plan-period">COP / mes ($49 USD)</span>
          </div>
          <ul class="plan-features">
            <li><i class="fa-solid fa-check"></i> Hasta 10 categorías Sub</li>
            <li><i class="fa-solid fa-check"></i> 8 Cuentas de Staff / DT</li>
            <li><i class="fa-solid fa-check"></i> Recaudo PSE / Wompi</li>
            <li><i class="fa-solid fa-check"></i> Control Dorsales &amp; Kits</li>
            <li><i class="fa-solid fa-check"></i> Tests Físicos &amp; Biometría</li>
            <li><i class="fa-solid fa-check"></i> Boletines Semestrales PDF</li>
            <li><i class="fa-solid fa-check"></i> Soporte Prioritario WhatsApp</li>
          </ul>
        </div>

        <!-- Plan 3 -->
        <div class="plan-card">
          <h3 class="plan-name">🏆 Club Élite</h3>
          <span class="plan-cap">Jugadores ILIMITADOS</span>
          <div class="plan-price-box">
            <span class="plan-price">$349.000</span>
            <span class="plan-period">COP / mes ($89 USD)</span>
          </div>
          <ul class="plan-features">
            <li><i class="fa-solid fa-check"></i> Categorías Ilimitadas</li>
            <li><i class="fa-solid fa-check"></i> Entrenadores Ilimitados</li>
            <li><i class="fa-solid fa-check"></i> Telemetría GPS &amp; ACWR</li>
            <li><i class="fa-solid fa-check"></i> Módulo Alquiler Canchas</li>
            <li><i class="fa-solid fa-check"></i> Tienda Virtual del Club</li>
            <li><i class="fa-solid fa-check"></i> Dominio Web Propio</li>
            <li><i class="fa-solid fa-check"></i> Gerente de Cuenta 24/7</li>
          </ul>
        </div>

      </div>

      <!-- ROI & Business Impact Section -->
      <h3 style="font-size: 10pt; font-weight: 800; color: #ffffff; margin-bottom: 2mm; display: flex; align-items: center; gap: 2mm;">
        <i class="fa-solid fa-arrow-trend-up" style="color: #34d399;"></i>
        <span>Retorno de Inversión Demostrable (ROI)</span>
      </h3>

      <div class="grid-4col" style="margin-bottom: 3.5mm;">
        <div class="roi-stat-box">
          <span class="roi-stat-num">+ $2.4M</span>
          <span class="roi-stat-lbl">Recuperación mensual de cartera en mora</span>
        </div>
        <div class="roi-stat-box">
          <span class="roi-stat-num">15 Horas</span>
          <span class="roi-stat-lbl">Ahorro semanal del personal directivo</span>
        </div>
        <div class="roi-stat-box">
          <span class="roi-stat-num">100%</span>
          <span class="roi-stat-lbl">Trazabilidad de pagos y recibos digitales</span>
        </div>
        <div class="roi-stat-box">
          <span class="roi-stat-num">0%</span>
          <span class="roi-stat-lbl">Planillas de papel o datos extraviados</span>
        </div>
      </div>

      <!-- Annual Discount Banner -->
      <div class="card card-highlight" style="margin-top: auto; padding: 2.5mm 4mm; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 2.5mm;">
          <i class="fa-solid fa-gift" style="color: #f59e0b; font-size: 12pt;"></i>
          <span style="font-size: 7.2pt; color: #ffffff;">
            <strong>Descuento Especial Pago Anual:</strong> Paga 10 meses y obtén <strong>12 meses de servicio completo</strong> (Ahorra 2 meses).
          </span>
        </div>
        <span style="font-size: 7pt; font-weight: 800; color: #34d399; font-family: 'JetBrains Mono', monospace;">- 17% OFF</span>
      </div>

      <div class="page-footer">
        <div class="footer-brand">
          <i class="fa-solid fa-shield-halved" style="color: #10b981;"></i>
          <span>SECTIC S.A.S. • SportCoreOS v1.0</span>
        </div>
        <span class="footer-page-num">PÁGINA 04</span>
      </div>
    </div>
  </div>


  <!-- =======================================================================
       PÁGINA 5: ONBOARDING, SEGURIDAD & CONTACTO COMERCIAL
       ======================================================================= -->
  <div class="page">
    <div class="pitch-grid"></div>
    <div class="glow-sphere glow-emerald" style="bottom: 10mm; right: -15mm; width: 110mm; height: 110mm;"></div>

    <div class="content-layer">
      <div class="page-header">
        <div class="header-logo-group">
          <img src="{logo_b64}" class="header-logo-img" alt="Logo">
          <div class="header-titles">
            <h1>Implementación &amp; Contacto Oficial</h1>
            <span>SECTIC S.A.S. Servicios Profesionales</span>
          </div>
        </div>
        <div class="header-badge">
          <i class="fa-solid fa-handshake"></i>
          <span>Onboarding Express</span>
        </div>
      </div>

      <h2 class="section-title">
        <i class="fa-solid fa-rocket"></i>
        <span>Puesta en Marcha en 4 Pasos Simples</span>
      </h2>
      <p class="section-subtitle">
        El equipo de ingenieros de <strong>SECTIC S.A.S.</strong> acompaña a tu club en todo el proceso de migración para estar operativos en menos de 72 horas.
      </p>

      <!-- 4 Steps Process Grid -->
      <div class="grid-2col" style="gap: 3mm; margin-bottom: 4mm;">
        <div class="step-card">
          <div class="step-num">1</div>
          <div>
            <h4 style="font-size: 8.5pt; font-weight: 800; color: #ffffff;">Diagnóstico &amp; Creación del Club</h4>
            <p style="font-size: 6.8pt; color: #94a3b8; line-height: 1.35;">Habilitamos el entorno en la nube con el escudo oficial de tu academia, categorías Sub y sedes deportivas.</p>
          </div>
        </div>

        <div class="step-card">
          <div class="step-num">2</div>
          <div>
            <h4 style="font-size: 8.5pt; font-weight: 800; color: #ffffff;">Migración Asistida de Jugadores</h4>
            <p style="font-size: 6.8pt; color: #94a3b8; line-height: 1.35;">Cargamos tu base de datos actual desde archivos Excel o planillas sin pérdida de historial ni esfuerzo manual.</p>
          </div>
        </div>

        <div class="step-card">
          <div class="step-num">3</div>
          <div>
            <h4 style="font-size: 8.5pt; font-weight: 800; color: #ffffff;">Capacitación al Cuerpo Técnico</h4>
            <p style="font-size: 6.8pt; color: #94a3b8; line-height: 1.35;">Sesión práctica virtual o presencial para directores, entrenadores y preparadores físicos sobre el uso de la app.</p>
          </div>
        </div>

        <div class="step-card">
          <div class="step-num">4</div>
          <div>
            <h4 style="font-size: 8.5pt; font-weight: 800; color: #ffffff;">Lanzamiento &amp; Portal a Padres</h4>
            <p style="font-size: 6.8pt; color: #94a3b8; line-height: 1.35;">Activación de la pasarela de pagos PSE/Wompi y despacho de credenciales móviles a los acudientes.</p>
          </div>
        </div>
      </div>

      <!-- Security & Compliance Banner -->
      <div class="card" style="margin-bottom: 4mm; padding: 3mm 4mm; display: flex; align-items: center; gap: 3.5mm;">
        <i class="fa-solid fa-lock" style="font-size: 16pt; color: #34d399;"></i>
        <div style="font-size: 6.8pt; color: #cbd5e1; line-height: 1.35;">
          <strong style="color: #ffffff;">Seguridad de Grado Empresarial:</strong> Cumplimiento estricto de la <strong>Ley 1581 de Protección de Datos Personales (Habeas Data)</strong> de menores de edad. Encriptación SSL 256-bit y respaldos automáticos cada 6 horas en infraestructura AWS.
        </div>
      </div>

      <!-- Contact Callout Box -->
      <div class="contact-box" style="margin-top: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="font-size: 13pt; font-weight: 900; color: #ffffff; letter-spacing: -0.02em;">
              ¿Listo para Llevar tu Academia al Siguiente Nivel?
            </h3>
            <p style="font-size: 7.8pt; color: #cbd5e1; margin-top: 0.5mm;">
              Agenda una demostración guiada de 15 minutos con nuestros especialistas en tecnología deportiva.
            </p>
          </div>
          <div style="background: #10b981; color: #0b0f19; font-size: 7.5pt; font-weight: 900; padding: 2mm 4mm; border-radius: 20px; white-space: nowrap;">
            DEMO GRATIS 7 DÍAS
          </div>
        </div>

        <div class="grid-2col" style="gap: 2mm; margin-top: 1mm;">
          <div class="contact-row">
            <div class="contact-icon"><i class="fa-brands fa-whatsapp"></i></div>
            <div>
              <span style="font-size: 6.5pt; color: #94a3b8; display: block;">Línea Comercial WhatsApp:</span>
              <strong style="color: #ffffff;">+57 (300) 123-4567 / +57 (310) 987-6543</strong>
            </div>
          </div>

          <div class="contact-row">
            <div class="contact-icon"><i class="fa-solid fa-envelope"></i></div>
            <div>
              <span style="font-size: 6.5pt; color: #94a3b8; display: block;">Correo Institucional:</span>
              <strong style="color: #ffffff;">contacto@sectic.com • ventas@sportcoreos.com</strong>
            </div>
          </div>

          <div class="contact-row">
            <div class="contact-icon"><i class="fa-solid fa-globe"></i></div>
            <div>
              <span style="font-size: 6.5pt; color: #94a3b8; display: block;">Sitio Web Oficial:</span>
              <strong style="color: #34d399;">https://sportcoreos.sectic.com</strong>
            </div>
          </div>

          <div class="contact-row">
            <div class="contact-icon"><i class="fa-solid fa-location-dot"></i></div>
            <div>
              <span style="font-size: 6.5pt; color: #94a3b8; display: block;">Sede Principal:</span>
              <strong style="color: #ffffff;">Cartagena &amp; Bogotá, Colombia</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="page-footer">
        <div class="footer-brand">
          <i class="fa-solid fa-shield-halved" style="color: #10b981;"></i>
          <span>SECTIC S.A.S. • SportCoreOS v1.0 • Athletic Performance Cloud</span>
        </div>
        <span class="footer-page-num">PÁGINA 05</span>
      </div>
    </div>
  </div>

</body>
</html>
"""

with open(output_html, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML generado exitosamente en: {output_html}")

chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
cmd = [
    chrome_path,
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--run-all-compositor-stages-before-draw",
    f"--print-to-pdf={output_pdf}",
    f"file://{output_html}"
]

print("Compilando PDF con Google Chrome Headless...")
result = subprocess.run(cmd, capture_output=True, text=True)
if result.returncode == 0 and os.path.exists(output_pdf):
    size_mb = os.path.getsize(output_pdf) / (1024 * 1024)
    print(f"PDF generado con éxito: {output_pdf} ({size_mb:.2f} MB)")
else:
    print(f"Error generando PDF: {result.stderr}")
