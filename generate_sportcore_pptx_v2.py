import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from PIL import Image

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# Color Palette: SportCoreOS Dark Sport Pro
BG_DARK = RGBColor(11, 15, 25)         # #0B0F19 Obsidian Titanium
CARD_BG = RGBColor(17, 24, 39)         # #111827 Carbon Slate
CARD_SURFACE = RGBColor(31, 41, 55)    # #1F2937 Surface Dark
BORDER_COLOR = RGBColor(55, 65, 81)    # #374151 Border Slate
ACCENT_GREEN = RGBColor(16, 185, 129)  # #10B981 Emerald Pitch
ACCENT_CYAN = RGBColor(6, 182, 212)    # #06B6D4 Stadium Cyan
ACCENT_GOLD = RGBColor(245, 158, 11)   # #F59E0B Championship Gold
ACCENT_VIOLET = RGBColor(139, 92, 246) # #8B5CF6 AI Violet
TEXT_WHITE = RGBColor(248, 250, 252)   # #F8FAFC Stadium White
TEXT_MUTED = RGBColor(148, 163, 184)   # #94A3B8 Neutral Muted
TEXT_BODY = RGBColor(226, 232, 240)    # #E2E8F0 Light Slate Body

LOGO_PATH = "/Users/sectic/Documents/Codigos Fuentes/SportCoreOS/branding/sportcore_logo.jpg"
SCREENSHOTS_BASE = "/Users/sectic/Documents/Codigos Fuentes/SportCoreOS/assets/screenshots"

def set_slide_background(slide, color=BG_DARK):
    bg_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg_shape.fill.solid()
    bg_shape.fill.fore_color.rgb = color
    bg_shape.line.fill.solid()
    bg_shape.line.color.rgb = color
    return bg_shape

def add_header(slide, title_text, category_text="SPORTCORE OS · PORTAFOLIO DE SERVICIOS"):
    cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.35))
    tf_cat = cat_box.text_frame
    tf_cat.word_wrap = True
    tf_cat.margin_left = tf_cat.margin_top = tf_cat.margin_right = tf_cat.margin_bottom = 0
    p_cat = tf_cat.paragraphs[0]
    p_cat.text = category_text.upper()
    p_cat.font.size = Pt(11)
    p_cat.font.bold = True
    p_cat.font.color.rgb = ACCENT_GREEN

    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.7), Inches(0.7))
    tf_title = title_box.text_frame
    tf_title.word_wrap = True
    tf_title.margin_left = tf_title.margin_top = tf_title.margin_right = tf_title.margin_bottom = 0
    p_title = tf_title.paragraphs[0]
    p_title.text = title_text
    p_title.font.size = Pt(23)
    p_title.font.bold = True
    p_title.font.color.rgb = TEXT_WHITE

    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.5), Inches(1.5), Inches(0.04))
    line.fill.solid()
    line.fill.fore_color.rgb = ACCENT_GREEN
    line.line.fill.solid()
    line.line.color.rgb = ACCENT_GREEN

def create_card(slide, left, top, width, height, bg_color=CARD_BG, border_color=BORDER_COLOR):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg_color
    if border_color:
        card.line.fill.solid()
        card.line.color.rgb = border_color
        card.line.width = Pt(1.5)
    else:
        card.line.fill.solid()
        card.line.color.rgb = bg_color
    return card

# ==============================================================================
# SLIDE 1: PORTADA EJECUTIVA
# ==============================================================================
s1 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s1, BG_DARK)
create_card(s1, Inches(0.8), Inches(0.8), Inches(11.733), Inches(5.9), bg_color=CARD_BG, border_color=ACCENT_GREEN)

if os.path.exists(LOGO_PATH):
    try:
        s1.shapes.add_picture(LOGO_PATH, Inches(1.3), Inches(1.2), height=Inches(1.1))
    except Exception as e:
        print("Logo error:", e)

# Badge Pill
pill = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.3), Inches(2.5), Inches(5.2), Inches(0.4))
pill.fill.solid()
pill.fill.fore_color.rgb = RGBColor(6, 44, 34)
pill.line.fill.solid()
pill.line.color.rgb = ACCENT_GREEN
p_p = pill.text_frame.paragraphs[0]
p_p.text = "⚡ PLATAFORMA INTEGRAL DE ALTO RENDIMIENTO DEPORTIVO"
p_p.font.size = Pt(10)
p_p.font.bold = True
p_p.font.color.rgb = ACCENT_GREEN
p_p.alignment = PP_ALIGN.CENTER

tb = s1.shapes.add_textbox(Inches(1.3), Inches(3.0), Inches(10.5), Inches(2.0))
tf = tb.text_frame
tf.word_wrap = True
p1 = tf.paragraphs[0]
p1.text = "SportCoreOS"
p1.font.size = Pt(46)
p1.font.bold = True
p1.font.color.rgb = TEXT_WHITE

p2 = tf.add_paragraph()
p2.text = "El Sistema Operativo para Academias, Clubes y Escuelas Deportivas"
p2.font.size = Pt(21)
p2.font.bold = True
p2.font.color.rgb = ACCENT_CYAN

p3 = tf.add_paragraph()
p3.text = "Portafolio Comercial de Servicios · Automatización Deportiva, Financiera y Operativa"
p3.font.size = Pt(13.5)
p3.font.color.rgb = TEXT_MUTED

# 3 Pillars Footer Cards
hb1 = create_card(s1, Inches(1.3), Inches(5.1), Inches(3.4), Inches(1.1), bg_color=CARD_SURFACE, border_color=BORDER_COLOR)
tb_h1 = s1.shapes.add_textbox(Inches(1.4), Inches(5.2), Inches(3.2), Inches(0.9))
tf_h1 = tb_h1.text_frame
p_h1 = tf_h1.paragraphs[0]
p_h1.text = "💳 Cero Morosidad (Recaudos PSE)"
p_h1.font.bold = True
p_h1.font.size = Pt(11.5)
p_h1.font.color.rgb = ACCENT_GOLD
p_h1_sub = tf_h1.add_paragraph()
p_h1_sub.text = "Cobranzas automáticas con pasarelas de pago, recibos digitales y control estricto de cartera."
p_h1_sub.font.size = Pt(9.5)
p_h1_sub.font.color.rgb = TEXT_MUTED

hb2 = create_card(s1, Inches(4.9), Inches(5.1), Inches(3.4), Inches(1.1), bg_color=CARD_SURFACE, border_color=BORDER_COLOR)
tb_h2 = s1.shapes.add_textbox(Inches(5.0), Inches(5.2), Inches(3.2), Inches(0.9))
tf_h2 = tb_h2.text_frame
p_h2 = tf_h2.paragraphs[0]
p_h2.text = "📋 Ficha 360° & Biometría"
p_h2.font.bold = True
p_h2.font.size = Pt(11.5)
p_h2.font.color.rgb = ACCENT_GREEN
p_h2_sub = tf_h2.add_paragraph()
p_h2_sub.text = "Historial antropométrico, tests de condición física, radar de talento y boletines con IA."
p_h2_sub.font.size = Pt(9.5)
p_h2_sub.font.color.rgb = TEXT_MUTED

hb3 = create_card(s1, Inches(8.5), Inches(5.1), Inches(3.4), Inches(1.1), bg_color=CARD_SURFACE, border_color=BORDER_COLOR)
tb_h3 = s1.shapes.add_textbox(Inches(8.6), Inches(5.2), Inches(3.2), Inches(0.9))
tf_h3 = tb_h3.text_frame
p_h3 = tf_h3.paragraphs[0]
p_h3.text = "📱 App Web & Móvil Multi-Rol"
p_h3.font.bold = True
p_h3.font.size = Pt(11.5)
p_h3.font.color.rgb = ACCENT_CYAN
p_h3_sub = tf_h3.add_paragraph()
p_h3_sub.text = "Portales independientes para Directores, Entrenadores, Acudientes y Jugadores en tiempo real."
p_h3_sub.font.size = Pt(9.5)
p_h3_sub.font.color.rgb = TEXT_MUTED

# ==============================================================================
# SLIDE 2: EL RETO TRADICIONAL VS SPORTCOREOS
# ==============================================================================
s2 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s2, BG_DARK)
add_header(s2, "¿Por Qué SportCoreOS? Transformando los Dolores de las Escuelas Deportivas", "DIAGNÓSTICO DEL SECTOR")

# Left Column: Problems
create_card(s2, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.1), bg_color=RGBColor(38, 20, 24), border_color=RGBColor(239, 68, 68))
tb_p = s2.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(5.0), Inches(4.7))
tf_p = tb_p.text_frame
tf_p.word_wrap = True
p = tf_p.paragraphs[0]
p.text = "❌ Operación Tradicional (Caos & Pérdida de Dinero)"
p.font.size = Pt(15.5)
p.font.bold = True
p.font.color.rgb = RGBColor(248, 113, 113)

items_problem = [
    ("Morosidad Crónica del 30% al 45%", "Cobros manuales por WhatsApp, transferencias sin identificar en extractos y discusiones incómodas con padres."),
    ("Falta de Trazabilidad Atlética", "Mediciones de peso, talla y test físicos en libretas de papel que se extravían y nunca se entregan a acudientes."),
    ("Convocatorias Desorganizadas", "Alineaciones enviadas a última hora por chats, confusión con la hora y sede del partido, y planteles incompletos."),
    ("Dorsales Duplicados & Pérdida de Indumentaria", "Falta de control de dorsales en planillas oficiales y descontrol en la entrega de kits de uniformes."),
    ("Falta de Profesionalismo Percibido", "Padres de familia que no ven retorno formativo y desertan hacia otros clubes con mayor tecnología.")
]

for title, desc in items_problem:
    p_t = tf_p.add_paragraph()
    p_t.text = f"• {title}:"
    p_t.font.bold = True
    p_t.font.size = Pt(11.5)
    p_t.font.color.rgb = RGBColor(254, 202, 202)
    p_d = tf_p.add_paragraph()
    p_d.text = f"   {desc}"
    p_d.font.size = Pt(10)
    p_d.font.color.rgb = RGBColor(203, 213, 225)

# Right Column: Solution
create_card(s2, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.1), bg_color=RGBColor(16, 42, 34), border_color=ACCENT_GREEN)
tb_s = s2.shapes.add_textbox(Inches(7.1), Inches(2.0), Inches(5.1), Inches(4.7))
tf_s = tb_s.text_frame
tf_s.word_wrap = True
p_sol = tf_s.paragraphs[0]
p_sol.text = "✅ La Solución Integral con SportCoreOS"
p_sol.font.size = Pt(15.5)
p_sol.font.bold = True
p_sol.font.color.rgb = ACCENT_GREEN

items_solution = [
    ("Cobranzas Digitales Automatizadas", "Emisión programada de mensualidades, pasarela online (PSE / Tarjetas) y reducción de mora a menos del 8%."),
    ("Ficha Deportiva 360° & Evolución Biométrica", "Historial antropométrico digitalizado, gráficos de crecimiento, tests físicos estandarizados y semáforo de fatiga."),
    ("Convocatorias Inteligentes en 1 Clic", "Selección de nómina titular vs. suplentes, enlace GPS directo a la cancha y confirmación en tiempo real."),
    ("Matriz de Dorsales & Tienda Oficial", "Control automático de dorsales libres/ocupados por categoría y venta de kits y uniformes oficiales."),
    ("Boletines Deportivos con Inteligencia Artificial", "Informes técnicos semestrales generados con IA (Gemini) que enamoran a los padres y valorizan la matrícula.")
]

for title, desc in items_solution:
    p_t = tf_s.add_paragraph()
    p_t.text = f"• {title}:"
    p_t.font.bold = True
    p_t.font.size = Pt(11.5)
    p_t.font.color.rgb = RGBColor(167, 243, 208)
    p_d = tf_s.add_paragraph()
    p_d.text = f"   {desc}"
    p_d.font.size = Pt(10)
    p_d.font.color.rgb = RGBColor(226, 232, 240)

# ==============================================================================
# SLIDE 3: LAS 5 VENTAJAS COMPETITIVAS CLAVE
# ==============================================================================
s3 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s3, BG_DARK)
add_header(s3, "5 Razones Irresistibles para que su Club Adopte SportCoreOS", "PROPUESTA DE VALOR")

advantages = [
    ("1. Reducción Radical de la Cartera Morosa", ACCENT_GOLD,
     [
         "Cobro automatizado mensual con generación de recibos digitales instantáneos.",
         "Estados de cuenta claros para cada familia accesibles 24/7 en su celular.",
         "Recordatorios preventivos de pago para evitar acumulaciones de mora.",
         "Reportes de flujo de caja e ingresos mensuales en tiempo real para directiva."
     ]),
    ("2. Valorización de Marca & Status de Academia Pro", ACCENT_CYAN,
     [
         "Proyecta una imagen tecnológica de club europeo ante padres de familia.",
         "Boletines periódicos de rendimiento generados con IA con el escudo del club.",
         "Carnet digital de deportista con código QR para control en torneos.",
         "Portal móvil para inscripciones y control institucional."
     ]),
    ("3. Control Deportivo & Scouting Científico", ACCENT_GREEN,
     [
         "Seguimiento biométrico periódico: peso, talla, IMC y percentiles.",
         "Test de condición física: velocidad 30m, Cooper, salto y agilidad.",
         "Prevención de sobreentrenamiento con semáforo de carga atlética.",
         "Ficha técnica exportable para visores y scouts profesionales."
     ]),
    ("4. Operación sin Fricciones los Fines de Semana", RGBColor(249, 115, 22),
     [
         "Citaciones de partido enviadas directo a la app con confirmación en vivo.",
         "Ubicación GPS de la cancha integrada con Waze y Google Maps.",
         "Control estricto de dorsales sin riesgo de números duplicados.",
         "Acta digital de partido: registro de goles, tarjetas, cambios y MVP."
     ]),
    ("5. Nuevas Fuentes de Ingreso para la Escuela", ACCENT_VIOLET,
     [
         "Tienda virtual integrada para kits, uniformes y accesorios del club.",
         "Módulo para alquiler y monetización de canchas de fútbol a terceros.",
         "Venta de clínicas vacacionales y servicios formativos adicionales.",
         "Mayor retención de alumnos gracias a la experiencia gamificada."
     ])
]

coords = [
    (Inches(0.8), Inches(1.8), Inches(3.7), Inches(2.5)),
    (Inches(4.8), Inches(1.8), Inches(3.7), Inches(2.5)),
    (Inches(8.8), Inches(1.8), Inches(3.7), Inches(2.5)),
    (Inches(0.8), Inches(4.5), Inches(5.7), Inches(2.5)),
    (Inches(6.8), Inches(4.5), Inches(5.7), Inches(2.5))
]

for idx, (title, color, bullets) in enumerate(advantages):
    c_left, c_top, c_width, c_height = coords[idx]
    create_card(s3, c_left, c_top, c_width, c_height, bg_color=CARD_BG, border_color=color)
    tb_c = s3.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.12), c_width - Inches(0.4), c_height - Inches(0.24))
    tf_c = tb_c.text_frame
    tf_c.word_wrap = True
    
    p_t = tf_c.paragraphs[0]
    p_t.text = title
    p_t.font.bold = True
    p_t.font.size = Pt(12.5)
    p_t.font.color.rgb = color
    
    for b in bullets:
        p_b = tf_c.add_paragraph()
        p_b.text = f"✔ {b}"
        p_b.font.size = Pt(9.5)
        p_b.font.color.rgb = TEXT_BODY

# ==============================================================================
# SLIDE 4: ECOSISTEMA MULTI-ROL (WEB & MÓVIL)
# ==============================================================================
s4 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s4, BG_DARK)
add_header(s4, "Una Plataforma Integral Conectando a Toda la Comunidad Deportiva", "ARQUITECTURA DE ROLES")

roles = [
    ("🏢 Directores & Administradores", ACCENT_GOLD,
     "Control Financiero y Estratégico",
     [
         "Panel de control con KPIs financieros, recaudos y matrículas activas.",
         "Gestión integral de sedes, categorías (Sub-7 a Sub-20) y entrenadores.",
         "Facturación masiva y cobranza automatizada de pensiones y torneos.",
         "Supervisión del stock de indumentaria y alquiler de canchas.",
         "Acceso seguro desde PC, Mac o Tablet con permisos por rol."
     ]),
    ("⚽ Entrenadores & Cuerpo Técnico", ACCENT_GREEN,
     "Gestión Táctica y Formativa en Campo",
     [
         "Toma de asistencia express en entrenamientos con un solo toque.",
         "Convocatorias a partidos con alineación titular y suplentes.",
         "Registro de test físicos, antropometría y notas técnicas por jugador.",
         "Acta digital en vivo de partidos (goles, tarjetas, sustituciones).",
         "Diseño y asignación de retos de entrenamiento y microciclos."
     ]),
    ("👨‍👩‍👦 Familias, Acudientes & Jugadores", ACCENT_CYAN,
     "Experiencia Digital y Sentido de Pertenencia",
     [
         "Notificación push de citación a partidos con mapa GPS de la sede.",
         "Consulta de estados de cuenta y pago de mensualidades en línea.",
         "Carnet digital de deportista con código QR para torneos.",
         "Descarga de boletines semestrales de evolución deportiva con IA.",
         "Modo Carrera: retos audiovisuales, niveles desbloqueables y medallas."
     ])
]

for idx, (title, color, subtitle, points) in enumerate(roles):
    pleft = Inches(0.8 + idx * 3.95)
    create_card(s4, pleft, Inches(1.8), Inches(3.7), Inches(5.1), bg_color=CARD_BG, border_color=color)
    tb_plat = s4.shapes.add_textbox(pleft + Inches(0.2), Inches(2.0), Inches(3.3), Inches(4.7))
    tf_p = tb_plat.text_frame
    tf_p.word_wrap = True
    
    p_t = tf_p.paragraphs[0]
    p_t.text = title
    p_t.font.bold = True
    p_t.font.size = Pt(13.5)
    p_t.font.color.rgb = color
    
    p_sub = tf_p.add_paragraph()
    p_sub.text = subtitle
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = TEXT_MUTED
    p_sub.font.italic = True
    
    tf_p.add_paragraph().text = ""
    
    for pt in points:
        p_pt = tf_p.add_paragraph()
        p_pt.text = f"• {pt}"
        p_pt.font.size = Pt(10)
        p_pt.font.color.rgb = TEXT_BODY

# ==============================================================================
# STANDARDIZED MODULE SLIDE BUILDER
# ==============================================================================
def add_module_slide(title, module_num, tagline, highlights, sample_records, screenshot_rel_path, accent_color=ACCENT_GREEN):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(s, BG_DARK)
    num_str = f"0{module_num}" if int(module_num) < 10 else f"{module_num}"
    add_header(s, f"Módulo {module_num}: {title}", f"CATÁLOGO DE MÓDULOS SPORTCORE OS — {num_str}")

    # Tagline Pill
    tag_card = create_card(s, Inches(0.8), Inches(1.65), Inches(11.733), Inches(0.42), bg_color=RGBColor(17, 24, 39), border_color=None)
    tb_tag = s.shapes.add_textbox(Inches(1.0), Inches(1.68), Inches(11.3), Inches(0.35))
    tf_tag = tb_tag.text_frame
    p_tag = tf_tag.paragraphs[0]
    p_tag.text = f"💡 {tagline}"
    p_tag.font.size = Pt(10.5)
    p_tag.font.color.rgb = ACCENT_CYAN
    p_tag.font.bold = True

    # Left Column: Features & Highlights Card (Height: 4.8)
    create_card(s, Inches(0.8), Inches(2.20), Inches(7.5), Inches(4.85), bg_color=CARD_BG, border_color=accent_color)
    tb_f = s.shapes.add_textbox(Inches(1.05), Inches(2.30), Inches(7.0), Inches(4.65))
    tf_f = tb_f.text_frame
    tf_f.word_wrap = True
    
    # Sample records callout box (First inside left card)
    p_rec_h = tf_f.paragraphs[0]
    p_rec_h.text = "👁 REGISTROS REALES EN PANTALLA:"
    p_rec_h.font.size = Pt(10.5)
    p_rec_h.font.bold = True
    p_rec_h.font.color.rgb = ACCENT_GOLD
    
    p_rec_b = tf_f.add_paragraph()
    p_rec_b.text = sample_records
    p_rec_b.font.size = Pt(9.5)
    p_rec_b.font.color.rgb = RGBColor(254, 240, 138)
    
    tf_f.add_paragraph().text = "" # spacer
    
    p_fh = tf_f.add_paragraph()
    p_fh.text = "Funcionalidades Clave & Beneficios Operativos"
    p_fh.font.size = Pt(12.5)
    p_fh.font.bold = True
    p_fh.font.color.rgb = accent_color
    
    for h_title, h_desc in highlights:
        p_ht = tf_f.add_paragraph()
        p_ht.text = f"✔ {h_title}:"
        p_ht.font.bold = True
        p_ht.font.size = Pt(10)
        p_ht.font.color.rgb = TEXT_WHITE
        
        p_hd = tf_f.add_paragraph()
        p_hd.text = f"   {h_desc}"
        p_hd.font.size = Pt(9)
        p_hd.font.color.rgb = TEXT_MUTED

    # Right Column: Screenshot Card Container (Width: 4.033, Height: 4.85)
    container_left = Inches(8.5)
    container_top = Inches(2.20)
    container_w = Inches(4.033)
    container_h = Inches(4.85)
    create_card(s, container_left, container_top, container_w, container_h, bg_color=CARD_SURFACE, border_color=BORDER_COLOR)
    
    img_path = os.path.join(SCREENSHOTS_BASE, screenshot_rel_path) if screenshot_rel_path else None
    if img_path and os.path.exists(img_path):
        try:
            im = Image.open(img_path)
            orig_w, orig_h = im.size
            # Max dimensions to fit inside container with padding
            max_h = Inches(4.35)
            calc_w = max_h * (orig_w / orig_h)
            calc_h = max_h
            if calc_w > Inches(3.6):
                calc_w = Inches(3.6)
                calc_h = calc_w * (orig_h / orig_w)
            
            img_left = container_left + (container_w - calc_w) / 2
            img_top = container_top + Inches(0.12)
            
            s.shapes.add_picture(img_path, img_left, img_top, width=calc_w, height=calc_h)
            
            # Bottom caption
            cap = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, container_left + Inches(0.2), container_top + Inches(4.5), container_w - Inches(0.4), Inches(0.28))
            cap.fill.solid()
            cap.fill.fore_color.rgb = RGBColor(11, 15, 25)
            cap.line.fill.solid()
            cap.line.color.rgb = RGBColor(11, 15, 25)
            p_cap = cap.text_frame.paragraphs[0]
            p_cap.text = "📱 Captura Real de la App SportCoreOS"
            p_cap.font.size = Pt(8.5)
            p_cap.font.color.rgb = ACCENT_GREEN
            p_cap.alignment = PP_ALIGN.CENTER
        except Exception as e:
            print(f"Error adding screenshot {screenshot_rel_path}:", e)
    else:
        print(f"Screenshot NOT found: {img_path}")

# ==============================================================================
# SLIDES 5 TO 14: 10 MODULES
# ==============================================================================

# Modulo 1: Dashboard y Sedes
add_module_slide(
    title="Dashboard Ejecutivo & Gestión de Sedes y Categorías",
    module_num="1",
    tagline="Visibilidad gerencial completa de atletas inscritos, ingresos, sedes y categorías.",
    sample_records="Deportista en Foco: Samuel Díaz Restrepo (#10) · Categoría: Sub-15 Élite · Próximo Encuentro: FCFC vs Atlético Nacional (Sede El Prado).",
    highlights=[
        ("Indicadores Clave en Tiempo Real (KPIs)", "Total de alumnos matriculados, porcentaje de asistencia semanal, balance de cobros y partidos."),
        ("Multi-Sede y Gestión de Complejos", "Administración independiente de canchas y entrenamientos por sede o filial del club."),
        ("Categorización Oficial por Edades", "Segmentación de planteles desde Sub-7 hasta Sub-20, masculina y femenina."),
        ("Control de Staff y Asignación Técnica", "Asignación de director técnico, preparador físico y entrenador de arqueros por categoría.")
    ],
    screenshot_rel_path="01_inicio_dashboard_raw.png",
    accent_color=ACCENT_CYAN
)

# Modulo 2: Entrenamientos & Asistencia
add_module_slide(
    title="Entrenamientos, Microciclos & Control de Asistencia",
    module_num="2",
    tagline="Registro rápido de asistencia en campo con un solo toque y métricas de regularidad.",
    sample_records="Sesión Activa: Sub-15 Élite A (8 Atletas presentes) · Jugadores visibles: Santiago Restrepo #8 (Presente), Mateo Gómez #10 (Presente).",
    highlights=[
        ("Pase de Lista Ultrarrápido en Celular", "El entrenador marca presente, falta justificada o tardanza en segundos desde la línea de banda."),
        ("Planificación de Microciclos", "Cargue los objetivos del entrenamiento: técnica individual, rondos, táctica fija o físico."),
        ("Control de Carga & Prevención de Lesiones", "Monitoreo del semáforo de fatiga y volumen de minutos de entrenamiento acumulados."),
        ("Notificación Inmediata al Acudiente", "El padre recibe confirmación de que su hijo ya está bajo la supervisión del club.")
    ],
    screenshot_rel_path="02_entrenamientos_asistencia_raw.png",
    accent_color=ACCENT_GREEN
)

# Modulo 3: Calendario & Fixture
add_module_slide(
    title="Calendario Oficial, Partidos & Fixture Satelital",
    module_num="3",
    tagline="Fixture completo de todas las categorías con geolocalización de canchas y rivales.",
    sample_records="Marcadores Registrados: Sub-17 Futuros Cracks FC 2 - 0 Academia Millonarios FC · Sub-15 Élite 2 - 0 Santa Fe Div. Menores · Enlace GPS activo.",
    highlights=[
        ("Fixture Unificado de la Academia", "Calendario de torneos locales, liga departamental y amistosos en una sola pantalla."),
        ("Ruta Satelital GPS Integrada", "Enlace directo con Google Maps y Waze para que las familias lleguen puntuales."),
        ("Diferenciación de Hora de Citación vs Pitazo", "Hora de llegada al camerino (charla técnica) separada de la hora de inicio oficial."),
        ("Historial de Resultados y Marcadores", "Archivo permanente de partidos jugados, goles a favor, en contra y estadísticas de torneo.")
    ],
    screenshot_rel_path="03_partidos_calendario_raw.png",
    accent_color=ACCENT_GOLD
)

# Modulo 4: Convocatorias & Alineación
add_module_slide(
    title="Convocatorias Inteligentes, Nómina Titular & Táctica",
    module_num="4",
    tagline="Seleccione el once titular, informe a las familias y reciba confirmaciones en tiempo real.",
    sample_records="Once Titular Confirmado: Sebastián Muñoz #1 (POR), Andrés Salazar #2 (DEF), Camilo Torres #4 (DEF), Juan David Arias #5 (MED), Mateo Morales #10 (EXT).",
    highlights=[
        ("Selección Técnica Titulares vs Suplentes", "Alinee la nómina oficial del fin de semana con asignación visual de posiciones."),
        ("Confirmación de Asistencia en Tiempo Real", "Los padres confirman disponibilidad desde la app, evitando viajar con el plantel incompleto."),
        ("Control Estricto de Dorsales", "Garantiza que ningún jugador use camiseta repetida evitando multas o pérdida de puntos."),
        ("Rol de Capitán y Líder de Grupo", "Designación de capitanía y roles específicos (tiros libres, penales, tiros de esquina).")
    ],
    screenshot_rel_path="04_convocatorias_tactica_raw.png",
    accent_color=ACCENT_CYAN
)

# Modulo 5: Alquiler de Canchas
add_module_slide(
    title="Alquiler & Monetización de Canchas Deportivas",
    module_num="5",
    tagline="Genere ingresos recurrentes alquilando sus campos en horarios libres sin enredos de agenda.",
    sample_records="Cancha Disponible: Cancha Principal El Prado (Fútbol 11 - Sintética) · Tarifa: $190.000 COP/hora · Horarios: 06:00 PM a 10:00 PM.",
    highlights=[
        ("Motor de Reservas con Bloqueo de Franjas", "Evita cruces de reservas entre entrenamientos de la academia y clientes particulares."),
        ("Tarifas Dinámicas Diurnas vs Nocturnas", "Precios diferenciados para horas con iluminación artificial o fines de semana."),
        ("Cobro de Seña o Anticipo Online", "Recepción de pagos vía PSE para asegurar la reserva y reducir cancelaciones."),
        ("Control de Iluminación y Mantenimiento", "Bloqueo preventivo de horarios por reparaciones o mantenimiento agronómico.")
    ],
    screenshot_rel_path="05_canchas_alquiler_raw.png",
    accent_color=ACCENT_GREEN
)

# Modulo 6: Rendimiento con IA & Boletines
add_module_slide(
    title="Evaluación Atlética con IA (Gemini) & Boletines Deportivos",
    module_num="6",
    tagline="Boletines semestrales generados con Inteligencia Artificial que enamoran a las familias.",
    sample_records="Ficha Evaluada: Mateo Morales Silva · Calificación Global: 88/100 · Velocidad: 28.4 km/h · Resistencia: 92% · Diagnóstico de IA generado por Gemini.",
    highlights=[
        ("Generación de Diagnóstico con IA", "Algoritmo Gemini que redacta observaciones formativas personalizadas para cada niño."),
        ("Radar de Habilidades Deportivas", "Gráficos de tela de araña: técnica individual, velocidad, resistencia, visión y disciplina."),
        ("Boletín PDF Descargable con Escudo", "Documento corporativo de alta calidad para entregar a padres al cierre de cada semestre."),
        ("Histórico Antropométrico y Percentiles", "Evolución de peso, estatura y masa muscular para detectar retrasos madurativos.")
    ],
    screenshot_rel_path="06_boletin_rendimiento_ia_raw.png",
    accent_color=ACCENT_VIOLET
)

# Modulo 7: Carnet Digital QR
add_module_slide(
    title="Carnet Digital de Jugador & Control de Acceso con QR",
    module_num="7",
    tagline="Credenciales digitales dinámicas con foto, QR de verificación y compatibilidad con Apple Wallet.",
    sample_records="Carnet Verificado: Mateo Morales Silva · Dorsal: #10 · Categoría: Sub-15 Élite · EPS: Sura · Estado: ACTIVO con QR único y Apple Wallet.",
    highlights=[
        ("Credencial Segura contra Fraudes", "Código QR único que no puede ser falsificado ni compartido indebidamente."),
        ("Apertura de Molinetes y Asistencia Rápida", "Escaneo veloz en puerta de entrada para registrar ingreso a las instalaciones."),
        ("Ficha Médica de Emergencia Integrada", "El QR despliega grupo sanguíneo, EPS y contactos de emergencia del menor."),
        ("Ahorro de Costos de Carnetización", "Elimina el gasto continuo de imprimir carnets plásticos que los niños pierden.")
    ],
    screenshot_rel_path="07_carnet_digital_jugador_raw.png",
    accent_color=ACCENT_CYAN
)

# Modulo 8: Tienda Oficial & Indumentaria
add_module_slide(
    title="Tienda Oficial, Venta de Kits & Control de Stock",
    module_num="8",
    tagline="Monetice la marca de su academia vendiendo uniformes, termos y accesorios en la app.",
    sample_records="Catálogo Activo: Kit Competencia Oficial 2026 ($145.000 COP) · Uniforme Presentación ($210.000 COP) · Stock por tallas (4 a XL).",
    highlights=[
        ("Catálogo de Kits y Merchandising", "Venta de uniformes de competencia, kits de entrenamiento, chaquetas y accesorios."),
        ("Control de Stock y Tallas en Bodega", "Inventario en tiempo real por tallas para saber exactamente cuándo pedir confección."),
        ("Pedidos y Pagos Directos desde la App", "Los padres eligen la talla y pagan el uniforme sin filas ni trámites presenciales."),
        ("Nueva Fuente de Ingresos para el Club", "Rentabilice la marca oficial de su club deportivo con margen comercial asegurado.")
    ],
    screenshot_rel_path="08_tienda_kits_oficiales_raw.png",
    accent_color=RGBColor(236, 72, 153)
)

# Modulo 9: Recaudos & Pagos PSE
add_module_slide(
    title="Estado de Cuenta, Cobranzas & Pasarela de Pagos PSE",
    module_num="9",
    tagline="Reduzca la morosidad a menos del 8% con cobros en línea, recibos automáticos y pasarela segura.",
    sample_records="Estado de Cuenta: Samuel Díaz (Sub-15 Élite) · Saldo Pendiente: $220.000 COP · Cuota Mensual: $180.000 COP · Botón directo PSE / Wompi.",
    highlights=[
        ("Recaudos Digitales Vía PSE y Tarjetas", "Las familias pagan en 1 clic desde su celular a cualquier hora del día."),
        ("Conciliación Bancaria Automática", "Se acabaron las capturas de pantalla de transferencias bancarias sin identificar."),
        ("Recibos Digitales y Facturación Masiva", "Emisión automática del comprobante contable al acudiente tras el pago."),
        ("Semáforo Preventivo de Cartera", "Alertas amables antes de la fecha de corte para evitar deudas acumuladas.")
    ],
    screenshot_rel_path="tablet10/09_tablet10_pagos_recaudos_raw.png",
    accent_color=ACCENT_GOLD
)

# Modulo 10: Modo Carrera Gamificado
add_module_slide(
    title="Modo Carrera: Carta de Jugador, Retos Deportivos & XP",
    module_num="10",
    tagline="Fidelice a sus deportistas con cartas estilo FUT, retos en casa y puntos de experiencia.",
    sample_records="Carta en Pantalla: Carlos · Rating 84 EXT (Plata) · Sub-15 Élite · 87 RIT, 82 TIR, 85 PAS, 86 REG · 3.120 XP acumulados · Retos DT en video.",
    highlights=[
        ("Carta Técnica Estilo Videojuego", "Cada deportista tiene su carta virtual con atributos de ritmo, pase y tiro."),
        ("Retos y Tareas Asignadas por el DT", "Videos demostrativos de flexiones, dominio de balón y agilidad para practicar en casa."),
        ("Puntos de Experiencia (XP) & Niveles", "Premia el esfuerzo, la puntualidad y la constancia de cada niño."),
        ("Fidelización Masiva de Jugadores", "Convierte la formación deportiva en una aventura motivante que los aleja de pantallas ociosas.")
    ],
    screenshot_rel_path="tablet10/11_tablet10_modo_carrera_juego_raw.png",
    accent_color=ACCENT_GREEN
)

# ==============================================================================
# SLIDE 15: PLANES COMERCIALES & PRICING
# ==============================================================================
s15 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s15, BG_DARK)
add_header(s15, "Planes Comerciales Diseñados para Escalar con su Club", "INVERSIÓN & MODELO SAAS")

plans = [
    ("⚽ PLAN SEMILLERO", ACCENT_GOLD, "$89.000 COP / mes", "Ideal para escuelas en etapa de inicio",
     [
         "Hasta 60 Jugadores activos",
         "Hasta 4 Categorías deportivas",
         "3 Usuarios Entrenadores / Staff",
         "Ficha deportiva básica (Peso/Talla)",
         "Módulo de Convocatorias y Partidos",
         "Cobro de pensiones por PSE / Tarjeta",
         "Portal móvil para acudientes",
         "Soporte técnico por WhatsApp hábil"
     ]),
    ("⭐ PLAN ACADEMIA PRO", ACCENT_GREEN, "$189.000 COP / mes", "El más elegido por clubes competitivos",
     [
         "Hasta 180 Jugadores activos",
         "Hasta 10 Categorías deportivas",
         "8 Usuarios Entrenadores / Staff",
         "Ficha completa + Tests físicos y antropometría",
         "Control de Dorsales e Indumentaria oficial",
         "Generación de Boletines con Inteligencia Artificial",
         "Subdominio propio del club (ej. tuescuela.sportcore.site)",
         "Soporte técnico prioritario por WhatsApp"
     ]),
    ("🏆 PLAN CLUB ÉLITE", ACCENT_CYAN, "$349.000 COP / mes", "Para academias de alto rendimiento y proyección",
     [
         "Jugadores Ilimitados",
         "Categorías Ilimitadas",
         "Entrenadores y Staff Ilimitados",
         "Scouting avanzado y radar de condición física",
         "Módulo completo de Alquiler de Canchas incluido",
         "Tienda virtual del club sin costo adicional",
         "Dominio web propio exclusivo (ej. miacademiafc.com)",
         "Gerente de cuenta dedicado 24/7 y onboarding VIP"
     ])
]

for idx, (p_title, color, price, desc, feats) in enumerate(plans):
    c_left = Inches(0.8 + idx * 3.95)
    create_card(s15, c_left, Inches(1.8), Inches(3.7), Inches(5.1), bg_color=CARD_BG, border_color=color)
    tb_pl = s15.shapes.add_textbox(c_left + Inches(0.2), Inches(2.0), Inches(3.3), Inches(4.7))
    tf_pl = tb_pl.text_frame
    tf_pl.word_wrap = True
    
    p_t = tf_pl.paragraphs[0]
    p_t.text = p_title
    p_t.font.bold = True
    p_t.font.size = Pt(14)
    p_t.font.color.rgb = color
    
    p_pr = tf_pl.add_paragraph()
    p_pr.text = price
    p_pr.font.bold = True
    p_pr.font.size = Pt(18)
    p_pr.font.color.rgb = TEXT_WHITE
    
    p_sub = tf_pl.add_paragraph()
    p_sub.text = desc
    p_sub.font.size = Pt(9.5)
    p_sub.font.color.rgb = TEXT_MUTED
    p_sub.font.italic = True
    
    tf_pl.add_paragraph().text = ""
    
    for f in feats:
        p_f = tf_pl.add_paragraph()
        p_f.text = f"✔ {f}"
        p_f.font.size = Pt(9.5)
        p_f.font.color.rgb = TEXT_BODY

# ==============================================================================
# SLIDE 16: CIERRE & CONTACTO COMERCIAL
# ==============================================================================
s16 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(s16, BG_DARK)
create_card(s16, Inches(0.8), Inches(0.8), Inches(11.733), Inches(5.9), bg_color=CARD_BG, border_color=ACCENT_GREEN)

tb_c = s16.shapes.add_textbox(Inches(1.2), Inches(1.1), Inches(10.9), Inches(1.5))
tf_c = tb_c.text_frame
tf_c.word_wrap = True
p_c1 = tf_c.paragraphs[0]
p_c1.text = "Lleve su Academia al Siguiente Nivel Profesional"
p_c1.font.size = Pt(30)
p_c1.font.bold = True
p_c1.font.color.rgb = TEXT_WHITE

p_c2 = tf_c.add_paragraph()
p_c2.text = "Agende una Demostración en Vivo de 15 Minutos y Active su Prueba Gratuita de 14 Días"
p_c2.font.size = Pt(16)
p_c2.font.bold = True
p_c2.font.color.rgb = ACCENT_GREEN

# Contact Cards
create_card(s16, Inches(1.2), Inches(2.8), Inches(5.2), Inches(3.5), bg_color=RGBColor(11, 15, 25), border_color=BORDER_COLOR)
tb_co1 = s16.shapes.add_textbox(Inches(1.4), Inches(3.0), Inches(4.8), Inches(3.1))
tf_co1 = tb_co1.text_frame
tf_co1.word_wrap = True

p_info = tf_co1.paragraphs[0]
p_info.text = "📞 Contacto Comercial & Soporte"
p_info.font.bold = True
p_info.font.size = Pt(14)
p_info.font.color.rgb = ACCENT_CYAN

contact_items = [
    ("📱 Teléfono / WhatsApp:", "+57 311 705 1171"),
    ("📧 Correo Directo:", "anroswell@gmail.com"),
    ("🌐 Plataforma Web:", "https://sportcore.site"),
    ("🏢 Desarrollado por:", "Sectic / SecticSolar S.A.S."),
    ("📍 Sede Comercial:", "Cartagena, Colombia (Cobertura Latam)")
]

for label, val in contact_items:
    p_i = tf_co1.add_paragraph()
    p_i.text = f"{label} {val}"
    p_i.font.size = Pt(11)
    p_i.font.color.rgb = TEXT_BODY

# Guarantee Card
create_card(s16, Inches(6.8), Inches(2.8), Inches(5.3), Inches(3.5), bg_color=RGBColor(11, 15, 25), border_color=ACCENT_GOLD)
tb_co2 = s16.shapes.add_textbox(Inches(7.0), Inches(3.0), Inches(4.9), Inches(3.1))
tf_co2 = tb_co2.text_frame
tf_co2.word_wrap = True

p_demo = tf_co2.paragraphs[0]
p_demo.text = "🎁 Garantía de Despliegue en 48 Horas"
p_demo.font.bold = True
p_demo.font.size = Pt(14)
p_demo.font.color.rgb = ACCENT_GOLD

p_d1 = tf_co2.add_paragraph()
p_d1.text = "Migración sin traumatismos de su escuela:"
p_d1.font.size = Pt(11)
p_d1.font.color.rgb = TEXT_MUTED

p_url = tf_co2.add_paragraph()
p_url.text = "✔ Migración Gratuita de Alumnos desde su archivo de Excel actual.\n✔ Capacitación en vivo para su cuerpo técnico de entrenadores.\n✔ Kit gráfico personalizado con el escudo de su club.\n✔ Prueba sin compromiso por 14 días con soporte VIP."
p_url.font.size = Pt(11)
p_url.font.color.rgb = TEXT_WHITE

output_path = "/Users/sectic/Documents/Codigos Fuentes/SportCoreOS/PORTAFOLIO_SERVICIOS_SPORTCOREOS.pptx"
prs.save(output_path)
print(f"SportCoreOS presentation saved successfully to {output_path}")
