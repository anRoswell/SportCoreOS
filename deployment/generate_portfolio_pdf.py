import base64
import os
import subprocess

branding_dir = "/Users/sectic/Documents/Codigos Fuentes/SportCoreOS/branding"
assets_dir = "/Users/sectic/Documents/Codigos Fuentes/SportCoreOS/assets/screenshots"
output_html = "/Users/sectic/Documents/Codigos Fuentes/SportCoreOS/portafolio_temp.html"
output_pdf = "/Users/sectic/Documents/Codigos Fuentes/SportCoreOS/PORTAFOLIO_DE_SERVICIOS_SPORTCOREOS_SECTIC.pdf"

def get_b64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            data = f.read()
            ext = os.path.splitext(path)[1].lower().replace(".", "")
            mime = "image/jpeg" if ext in ["jpg", "jpeg"] else "image/svg+xml" if ext == "svg" else "image/png"
            return f"data:{mime};base64,{base64.b64encode(data).decode('utf-8')}"
    return ""

logo_b64 = get_b64(os.path.join(branding_dir, "sportcore_logo.jpg"))
banner_b64 = get_b64(os.path.join(branding_dir, "sportcore_marketing_banner.jpg"))
mobile_icon_b64 = get_b64(os.path.join(branding_dir, "sportcore_mobile_icon.jpg"))
splash_b64 = get_b64(os.path.join(branding_dir, "sportcore_splashscreen.jpg"))
social_b64 = get_b64(os.path.join(branding_dir, "sportcore_social_post.jpg"))

# Module screenshots
shot_dashboard = get_b64(os.path.join(assets_dir, "01_inicio_dashboard_raw.png"))
shot_asistencia = get_b64(os.path.join(assets_dir, "02_entrenamientos_asistencia_raw.png"))
shot_convocatoria = get_b64(os.path.join(assets_dir, "04_convocatorias_tactica_raw.png"))
shot_carnet = get_b64(os.path.join(assets_dir, "07_carnet_digital_jugador_raw.png"))
shot_boletin_ia = get_b64(os.path.join(assets_dir, "06_boletin_rendimiento_ia_raw.png"))
shot_pagos = get_b64(os.path.join(assets_dir, "tablet10/09_tablet10_pagos_recaudos_raw.png"))

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

    .visual-module-card {{
      background: rgba(15, 23, 42, 0.88);
      border: 1px solid rgba(16, 185, 129, 0.28);
      border-radius: 3.5mm;
      padding: 3mm 3.5mm;
      display: grid;
      grid-template-columns: 1fr 30mm;
      gap: 3mm;
      align-items: center;
      position: relative;
      overflow: hidden;
    }}

    .visual-mockup-frame {{
      width: 29mm;
      height: 52mm;
      border-radius: 3.5mm;
      overflow: hidden;
      border: 1.5px solid #334155;
      box-shadow: 0 8px 18px rgba(0,0,0,0.6), 0 0 10px rgba(16, 185, 129, 0.15);
      background: #000000;
      flex-shrink: 0;
    }}

    .visual-mockup-frame img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }}

    /* =========================================================================
       PAGE 4: EVALUACIÓN ANTROPOMÉTRICA & CIENCIA DEPORTIVA
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
       PÁGINA 3: GALERÍA VISUAL & MÓDULOS EN OPERACIÓN REAL
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
          <i class="fa-solid fa-mobile-screen"></i>
          <span>Evidencias en Vivo</span>
        </div>
      </div>

      <h2 class="section-title">
        <i class="fa-solid fa-layer-group"></i>
        <span>Los Módulos Core de SportCoreOS en Operación</span>
      </h2>
      <p class="section-subtitle">
        Interfaz moderna, intuitiva y 100% adaptativa diseñada para agilizar el trabajo diario de directores, entrenadores y familias.
      </p>

      <!-- 2x2 Visual Cards Grid with Screenshots -->
      <div class="grid-2col" style="gap: 3.5mm; flex: 1;">
        
        <!-- Module 1: Dashboard -->
        <div class="visual-module-card">
          <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
            <div>
              <div class="pillar-header" style="margin-bottom: 1.5mm;">
                <div class="pillar-icon-wrap" style="background: rgba(16, 185, 129, 0.2); color: #34d399;"><i class="fa-solid fa-gauge-high"></i></div>
                <h3 class="pillar-title" style="font-size: 8.5pt;">1. Dashboard &amp; Sedes</h3>
              </div>
              <p class="pillar-desc" style="font-size: 6.5pt; margin-bottom: 2mm;">
                Supervisión ejecutiva de toda la academia: atletas inscritos, partidos activos, sedes deportivas y alertas de cartera morosa en tiempo real.
              </p>
              <div style="font-size: 6.2pt; color: #cbd5e1; line-height: 1.35;">
                <div><i class="fa-solid fa-check" style="color: #10b981; margin-right: 1mm;"></i> <strong>KPIs en vivo:</strong> Censo de alumnos y torneos.</div>
                <div><i class="fa-solid fa-check" style="color: #10b981; margin-right: 1mm;"></i> <strong>Multi-Sede:</strong> Canchas, filiales y sedes.</div>
              </div>
            </div>
            <div class="pillar-tags">
              <span class="pillar-tag">Dirección</span>
              <span class="pillar-tag">Finanzas</span>
            </div>
          </div>
          <div class="visual-mockup-frame">
            <img src="{shot_dashboard}" alt="Dashboard">
          </div>
        </div>

        <!-- Module 2: Convocatorias WhatsApp -->
        <div class="visual-module-card">
          <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
            <div>
              <div class="pillar-header" style="margin-bottom: 1.5mm;">
                <div class="pillar-icon-wrap" style="background: rgba(6, 182, 212, 0.2); color: #06b6d4;"><i class="fa-solid fa-bullhorn"></i></div>
                <h3 class="pillar-title" style="font-size: 8.5pt;">2. Citaciones WhatsApp</h3>
              </div>
              <p class="pillar-desc" style="font-size: 6.5pt; margin-bottom: 2mm;">
                Convocatorias oficiales a partidos y entrenamientos con 1 toque. Envío masivo con mapa satelital de la cancha y confirmación en tiempo real.
              </p>
              <div style="font-size: 6.2pt; color: #cbd5e1; line-height: 1.35;">
                <div><i class="fa-solid fa-check" style="color: #06b6d4; margin-right: 1mm;"></i> <strong>Citación 1-Tap:</strong> WhatsApp masivo a padres.</div>
                <div><i class="fa-solid fa-check" style="color: #06b6d4; margin-right: 1mm;"></i> <strong>GPS y Waze:</strong> Ubicación exacta de cancha.</div>
              </div>
            </div>
            <div class="pillar-tags">
              <span class="pillar-tag">1-Tap WA</span>
              <span class="pillar-tag">Confirmación</span>
            </div>
          </div>
          <div class="visual-mockup-frame">
            <img src="{shot_convocatoria}" alt="Convocatorias">
          </div>
        </div>

        <!-- Module 3: Asistencia en Cancha -->
        <div class="visual-module-card">
          <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
            <div>
              <div class="pillar-header" style="margin-bottom: 1.5mm;">
                <div class="pillar-icon-wrap" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24;"><i class="fa-solid fa-clipboard-check"></i></div>
                <h3 class="pillar-title" style="font-size: 8.5pt;">3. Asistencia en Cancha</h3>
              </div>
              <p class="pillar-desc" style="font-size: 6.5pt; margin-bottom: 2mm;">
                Planilla digital para directores técnicos y preparadores físicos. Registro táctil de asistencia, retardos, excusas médicas y minutos jugados.
              </p>
              <div style="font-size: 6.2pt; color: #cbd5e1; line-height: 1.35;">
                <div><i class="fa-solid fa-check" style="color: #f59e0b; margin-right: 1mm;"></i> <strong>Cero Papel:</strong> Planilla interactiva en móvil.</div>
                <div><i class="fa-solid fa-check" style="color: #f59e0b; margin-right: 1mm;"></i> <strong>Historial:</strong> Porcentaje de asistencia mensual.</div>
              </div>
            </div>
            <div class="pillar-tags">
              <span class="pillar-tag">Planilla DT</span>
              <span class="pillar-tag">Faltas &amp; Justificaciones</span>
            </div>
          </div>
          <div class="visual-mockup-frame">
            <img src="{shot_asistencia}" alt="Asistencia">
          </div>
        </div>

        <!-- Module 4: Carnet Digital QR & Estado de Cuenta -->
        <div class="visual-module-card">
          <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
            <div>
              <div class="pillar-header" style="margin-bottom: 1.5mm;">
                <div class="pillar-icon-wrap" style="background: rgba(139, 92, 246, 0.2); color: #a78bfa;"><i class="fa-solid fa-id-card"></i></div>
                <h3 class="pillar-title" style="font-size: 8.5pt;">4. Carnet QR &amp; Finanzas</h3>
              </div>
              <p class="pillar-desc" style="font-size: 6.5pt; margin-bottom: 2mm;">
                Credencial deportiva oficial para torneos con verificación QR en vivo. Estado de cuenta transparente con pasarela PSE y descarga de recibos.
              </p>
              <div style="font-size: 6.2pt; color: #cbd5e1; line-height: 1.35;">
                <div><i class="fa-solid fa-check" style="color: #a78bfa; margin-right: 1mm;"></i> <strong>Validación QR:</strong> Certificado de afiliación.</div>
                <div><i class="fa-solid fa-check" style="color: #a78bfa; margin-right: 1mm;"></i> <strong>Pagos PSE/Wompi:</strong> Paz y salvo digital.</div>
              </div>
            </div>
            <div class="pillar-tags">
              <span class="pillar-tag">Carnet QR</span>
              <span class="pillar-tag">PSE Recaudo</span>
            </div>
          </div>
          <div class="visual-mockup-frame">
            <img src="{shot_carnet}" alt="Carnet">
          </div>
        </div>

      </div>

      <!-- Tech Stack Footer Banner -->
      <div class="card" style="margin-top: auto; padding: 2.2mm 4mm; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 7pt; color: #94a3b8; font-weight: 600;">Ecosistema Tecnológico de Clase Mundial:</span>
        <div style="display: flex; gap: 3.5mm; font-size: 7pt; color: #cbd5e1; font-weight: 700;">
          <span><i class="fa-brands fa-angular" style="color: #dd0031;"></i> Angular Signals</span>
          <span><i class="fa-brands fa-node-js" style="color: #22c55e;"></i> NestJS</span>
          <span><i class="fa-solid fa-database" style="color: #3b82f6;"></i> PostgreSQL</span>
          <span><i class="fa-solid fa-shield-halved" style="color: #10b981;"></i> Multi-Tenant SaaS</span>
        </div>
      </div>

      <div class="page-footer">
        <div class="footer-brand">
          <i class="fa-solid fa-shield-halved" style="color: #10b981;"></i>
          <span>SECTIC S.A.S. • SportCoreOS v1.0 • Módulos en Cancha</span>
        </div>
        <span class="footer-page-num">PÁGINA 03</span>
      </div>
    </div>
  </div>


  <!-- =======================================================================
       PÁGINA 4: EVALUACIÓN ANTROPOMÉTRICA & BOLETINES CON INTELIGENCIA ARTIFICIAL
       ======================================================================= -->
  <div class="page">
    <div class="pitch-grid"></div>
    <div class="glow-sphere glow-emerald" style="top: 15mm; right: -15mm; width: 100mm; height: 100mm;"></div>
    <div class="glow-sphere glow-cyan" style="bottom: 10mm; left: -15mm; width: 90mm; height: 90mm;"></div>

    <div class="content-layer">
      <div class="page-header">
        <div class="header-logo-group">
          <img src="{logo_b64}" class="header-logo-img" alt="Logo">
          <div class="header-titles">
            <h1>Evaluación Deportiva &amp; Boletines con IA</h1>
            <span>Ciencia Formativa, Antropometría y Rendimiento Infantil</span>
          </div>
        </div>
        <div class="header-badge">
          <i class="fa-solid fa-chart-line"></i>
          <span>Análisis Biométrico &amp; Familiar</span>
        </div>
      </div>

      <h2 class="section-title">
        <i class="fa-solid fa-heart-pulse"></i>
        <span>¿Por qué Medir a los Niños y Entregar Informes a los Padres?</span>
      </h2>
      <p class="section-subtitle">
        En el fútbol formativo, <strong style="color: #ffffff;">lo que no se mide no se puede mejorar</strong>. Entregar informes periódicos transforma la percepción familiar de la academia, blinda la salud del menor y erradica la deserción de deportistas.
      </p>

      <!-- Main Layout: Left info pillars + Right phone mockup of Boletín -->
      <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 4mm; flex: 1;">
        
        <!-- Left Column: 4 Strategic Pillars -->
        <div style="display: flex; flex-direction: column; gap: 2.2mm;">
          
          <div class="pillar-card" style="border-left: 3px solid #10b981; padding: 2.5mm 3.5mm;">
            <div style="display: flex; align-items: center; gap: 2mm; margin-bottom: 0.8mm;">
              <div style="background: rgba(16, 185, 129, 0.2); color: #34d399; width: 6.5mm; height: 6.5mm; border-radius: 1.5mm; display: flex; align-items: center; justify-content: center; font-size: 8.5pt;"><i class="fa-solid fa-shield-heart"></i></div>
              <h4 style="font-size: 7.8pt; font-weight: 800; color: #ffffff;">1. Retención Familiar: De "Gasto" a "Inversión en su Hijo"</h4>
            </div>
            <p style="font-size: 6.4pt; color: #cbd5e1; line-height: 1.35;">
              Cuando los padres reciben un reporte formal con gráficos de velocidad, resistencia y peso/talla, comprueban el valor real de su pago mensual. Academias con informes periódicos reportan una <strong>reducción del 40% en retiros y morosidad</strong>.
            </p>
          </div>

          <div class="pillar-card" style="border-left: 3px solid #06b6d4; padding: 2.5mm 3.5mm;">
            <div style="display: flex; align-items: center; gap: 2mm; margin-bottom: 0.8mm;">
              <div style="background: rgba(6, 182, 212, 0.2); color: #06b6d4; width: 6.5mm; height: 6.5mm; border-radius: 1.5mm; display: flex; align-items: center; justify-content: center; font-size: 8.5pt;"><i class="fa-solid fa-child-reaching"></i></div>
              <h4 style="font-size: 7.8pt; font-weight: 800; color: #ffffff;">2. Salud Biológica &amp; Detección del Pico de Crecimiento (PHV)</h4>
            </div>
            <p style="font-size: 6.4pt; color: #cbd5e1; line-height: 1.35;">
              Durante la pubertad, los huesos crecen más rápido que los tendones. Registrar la curva antropométrica trimestral permite modular cargas de entrenamiento y <strong>prevenir lesiones severas por sobreuso</strong> como Osgood-Schlatter o sobrecargas articulares.
            </p>
          </div>

          <div class="pillar-card" style="border-left: 3px solid #f59e0b; padding: 2.5mm 3.5mm;">
            <div style="display: flex; align-items: center; gap: 2mm; margin-bottom: 0.8mm;">
              <div style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; width: 6.5mm; height: 6.5mm; border-radius: 1.5mm; display: flex; align-items: center; justify-content: center; font-size: 8.5pt;"><i class="fa-solid fa-trophy"></i></div>
              <h4 style="font-size: 7.8pt; font-weight: 800; color: #ffffff;">3. Gamificación &amp; Autoestima Deportiva del Niño</h4>
            </div>
            <p style="font-size: 6.4pt; color: #cbd5e1; line-height: 1.35;">
              El deportista compite contra sus propias marcas previas (ej. <em>"bajé 0.3s en el sprint de 30m"</em>). Visualizar su Radar FIFA y evolución técnica fortalece la disciplina, la autoconfianza y la cultura de superación constante en cancha.
            </p>
          </div>

          <div class="pillar-card" style="border-left: 3px solid #8b5cf6; padding: 2.5mm 3.5mm;">
            <div style="display: flex; align-items: center; gap: 2mm; margin-bottom: 0.8mm;">
              <div style="background: rgba(139, 92, 246, 0.2); color: #a78bfa; width: 6.5mm; height: 6.5mm; border-radius: 1.5mm; display: flex; align-items: center; justify-content: center; font-size: 8.5pt;"><i class="fa-solid fa-binoculars"></i></div>
              <h4 style="font-size: 7.8pt; font-weight: 800; color: #ffffff;">4. Historial Inmutable para Scouting &amp; Clubes Pro</h4>
            </div>
            <p style="font-size: 6.4pt; color: #cbd5e1; line-height: 1.35;">
              Los reclutadores de clubes profesionales no se fían de un solo partido; exigen la <strong>curva histórica de maduración deportiva</strong>. SportCoreOS crea una hoja de vida deportiva certificada con cada gol, minuto y test físico.
            </p>
          </div>

        </div>

        <!-- Right Column: Visual Boletín Mockup with IA highlight -->
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 4mm; padding: 3mm;">
          
          <div style="text-align: center; margin-bottom: 2mm; width: 100%;">
            <span style="background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-size: 6pt; font-weight: 800; padding: 1mm 2.5mm; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em;">
              <i class="fa-solid fa-wand-magic-sparkles"></i> Boletín Automatizado con IA
            </span>
            <div style="font-size: 6.8pt; color: #94a3b8; margin-top: 1mm;">Generado en 1 toque y enviado directo al WhatsApp del acudiente</div>
          </div>

          <div style="width: 52mm; height: 96mm; border-radius: 4mm; overflow: hidden; border: 2px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.6), 0 0 15px rgba(16, 185, 129, 0.2); background: #000;">
            <img src="{shot_boletin_ia}" style="width: 100%; height: 100%; object-fit: cover;" alt="Boletín de Rendimiento IA">
          </div>

          <div style="margin-top: 2mm; width: 100%; display: flex; justify-content: center; gap: 1.5mm; flex-wrap: wrap;">
            <span class="pillar-tag"><i class="fa-solid fa-radar" style="color: #10b981;"></i> Radar FIFA</span>
            <span class="pillar-tag">Sprint 30m</span>
            <span class="pillar-tag">Test Cooper</span>
            <span class="pillar-tag">Antropometría</span>
            <span class="pillar-tag">Percentiles OMS</span>
          </div>

        </div>

      </div>

      <!-- Bottom Banner: Valor Diferencial -->
      <div class="card card-highlight" style="margin-top: 3mm; padding: 2.2mm 4mm; display: flex; align-items: center; gap: 3mm;">
        <i class="fa-solid fa-brain" style="font-size: 13pt; color: #34d399; flex-shrink: 0;"></i>
        <div style="font-size: 6.8pt; color: #cbd5e1; line-height: 1.35;">
          <strong style="color: #ffffff;">Inteligencia Artificial al Servicio del Formador:</strong> Los entrenadores no pierden horas redactando diagnósticos individuales; el motor de IA de SportCoreOS analiza los tests, identifica fortalezas y genera recomendaciones tácticas y nutricionales personalizadas para cada alumno.
        </div>
      </div>

      <div class="page-footer">
        <div class="footer-brand">
          <i class="fa-solid fa-shield-halved" style="color: #10b981;"></i>
          <span>SECTIC S.A.S. • SportCoreOS v1.0 • Formación Deportiva Científica</span>
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
      <div class="grid-2col" style="gap: 3mm; margin-bottom: 3.5mm;">
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
      <div class="card" style="margin-bottom: 3.5mm; padding: 2.8mm 4mm; display: flex; align-items: center; gap: 3.5mm;">
        <i class="fa-solid fa-lock" style="font-size: 15pt; color: #34d399;"></i>
        <div style="font-size: 6.8pt; color: #cbd5e1; line-height: 1.35;">
          <strong style="color: #ffffff;">Seguridad de Grado Empresarial:</strong> Cumplimiento estricto de la <strong>Ley 1581 de Protección de Datos Personales (Habeas Data)</strong> de menores de edad. Encriptación SSL 256-bit y respaldos automáticos periódicos en infraestructura Cloud.
        </div>
      </div>

      <!-- Contact Callout Box -->
      <div class="contact-box" style="margin-top: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2mm;">
          <div>
            <h3 style="font-size: 12pt; font-weight: 900; color: #ffffff; letter-spacing: -0.02em;">
              ¿Listo para Llevar tu Academia al Siguiente Nivel?
            </h3>
            <p style="font-size: 7.5pt; color: #cbd5e1; margin-top: 0.5mm;">
              Agenda una demostración guiada de 15 minutos con nuestros especialistas en tecnología deportiva.
            </p>
          </div>
          <div style="background: #10b981; color: #0b0f19; font-size: 7.2pt; font-weight: 900; padding: 1.8mm 3.5mm; border-radius: 20px; white-space: nowrap;">
            DEMO EN VIVO
          </div>
        </div>

        <div class="grid-2col" style="gap: 2mm; margin-top: 1mm;">
          <div class="contact-row">
            <div class="contact-icon"><i class="fa-brands fa-whatsapp"></i></div>
            <div>
              <span style="font-size: 6.5pt; color: #94a3b8; display: block;">Línea Comercial WhatsApp:</span>
              <strong style="color: #ffffff;">+57 311 705 1171</strong>
            </div>
          </div>

          <div class="contact-row">
            <div class="contact-icon"><i class="fa-solid fa-envelope"></i></div>
            <div>
              <span style="font-size: 6.5pt; color: #94a3b8; display: block;">Correo Institucional:</span>
              <strong style="color: #ffffff;">anroswell@gmail.com</strong>
            </div>
          </div>

          <div class="contact-row">
            <div class="contact-icon"><i class="fa-solid fa-globe"></i></div>
            <div>
              <span style="font-size: 6.5pt; color: #94a3b8; display: block;">Plataforma Oficial:</span>
              <strong style="color: #34d399;">https://sportcoreos.secticsolar.site</strong>
            </div>
          </div>

          <div class="contact-row">
            <div class="contact-icon"><i class="fa-solid fa-location-dot"></i></div>
            <div>
              <span style="font-size: 6.5pt; color: #94a3b8; display: block;">Sede Comercial:</span>
              <strong style="color: #ffffff;">Cartagena de Indias, Colombia (Servicio Latam)</strong>
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

import shutil

print("Compilando PDF con Google Chrome Headless...")
result = subprocess.run(cmd, capture_output=True, text=True)
if result.returncode == 0 and os.path.exists(output_pdf):
    size_mb = os.path.getsize(output_pdf) / (1024 * 1024)
    print(f"PDF generado con éxito: {output_pdf} ({size_mb:.2f} MB)")
    
    # Replicate to target asset locations
    destinations = [
        "/Users/sectic/Documents/Codigos Fuentes/SportCoreOS/branding/PORTAFOLIO_DE_SERVICIOS_SPORTCOREOS_SECTIC.pdf",
        "/Users/sectic/Documents/Codigos Fuentes/SportCoreOS/SportCoreOS-web/public/assets/branding/PORTAFOLIO_DE_SERVICIOS_SPORTCOREOS_SECTIC.pdf",
        "/Users/sectic/Documents/Codigos Fuentes/SportCoreOS/SportCoreOS-web/src/assets/branding/PORTAFOLIO_DE_SERVICIOS_SPORTCOREOS_SECTIC.pdf",
        "/Users/sectic/Documents/Codigos Fuentes/SportCoreOS/SportCoreOS-mobile/src/assets/branding/PORTAFOLIO_DE_SERVICIOS_SPORTCOREOS_SECTIC.pdf",
        "/Users/sectic/Documents/Codigos Fuentes/SportCoreOS/assets/branding/PORTAFOLIO_DE_SERVICIOS_SPORTCOREOS_SECTIC.pdf"
    ]
    for dest in destinations:
        if os.path.exists(os.path.dirname(dest)):
            shutil.copy(output_pdf, dest)
            print(f"Copiado a: {dest}")
else:
    print(f"Error generando PDF: {result.stderr}")

