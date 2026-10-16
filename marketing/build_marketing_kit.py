from pathlib import Path
from textwrap import wrap

from PIL import Image, ImageDraw, ImageFont
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "branding" / "sportcore_logo.jpg"
OUT_MARKETING = ROOT / "output" / "marketing"
OUT_PDF = ROOT / "output" / "pdf" / "PORTAFOLIO_SERVICIOS_SPORTCOREOS_SIN_RANKING.pdf"

BG = "#0B0F19"
SURFACE = "#111827"
CARD = "#1F2937"
WHITE = "#F8FAFC"
MUTED = "#B8C4D4"
GREEN = "#10B981"
CYAN = "#06B6D4"
GOLD = "#F59E0B"


def font_paths():
    candidates = [
        Path("/System/Library/Fonts/Supplemental/Arial.ttf"),
        Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf"),
        Path("/Library/Fonts/Arial.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
    ]
    regular = next((p for p in candidates if p.exists() and "Bold" not in p.name), None)
    bold = next((p for p in candidates if p.exists() and "Bold" in p.name), None)
    if regular is None:
        return ImageFont.load_default(), ImageFont.load_default()
    return ImageFont.truetype(str(regular), 32), ImageFont.truetype(str(bold or regular), 32)


def fitted_font(path, size, bold=False):
    candidates = [
        Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf"),
        Path("/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    ]
    selected = next((p for p in candidates if p.exists()), None)
    return ImageFont.truetype(str(selected), size) if selected else ImageFont.load_default()


def rgb(hex_color):
    return tuple(int(hex_color[i:i + 2], 16) for i in (1, 3, 5))


def make_gradient(size, upper=BG, lower="#10252A"):
    width, height = size
    start = rgb(upper)
    end = rgb(lower)
    im = Image.new("RGB", size)
    pixels = im.load()
    for y in range(height):
        t = y / max(1, height - 1)
        row = tuple(round(start[i] * (1 - t) + end[i] * t) for i in range(3))
        for x in range(width):
            pixels[x, y] = row
    return im


def draw_wrapped(draw, text, xy, font, fill, max_width, line_gap=14):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        test = f"{current} {word}".strip()
        if draw.textbbox((0, 0), test, font=font)[2] <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    x, y = xy
    for line in lines:
        draw.text((x, y), line, font=font, fill=fill)
        box = draw.textbbox((x, y), line, font=font)
        y += (box[3] - box[1]) + line_gap
    return y


def draw_logo(draw, x, y, max_size=170):
    logo = Image.open(BRAND).convert("RGB")
    logo.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
    return logo, (x, y)


def marketing_art(size, title, subtitle, benefits, cta, filename, mode):
    OUT_MARKETING.mkdir(parents=True, exist_ok=True)
    im = make_gradient(size)
    draw = ImageDraw.Draw(im)
    w, h = size
    # A simple brand accent line gives the text-led layouts a consistent anchor.
    accent_h = max(12, int(w * 0.012))
    draw.rectangle((0, 0, w, accent_h), fill=rgb(GREEN))
    margin = int(w * 0.075)
    brand_x = margin
    brand_y = int(h * 0.055)
    logo_size = int(min(w, h) * (0.15 if mode == "square" else 0.13))
    logo, logo_xy = draw_logo(draw, brand_x, brand_y, logo_size)
    im.paste(logo, logo_xy)
    draw = ImageDraw.Draw(im)

    title_size = int(w * (0.071 if mode == "square" else 0.067))
    body_size = int(w * (0.029 if mode == "square" else 0.028))
    small_size = int(w * 0.020)
    title_font = fitted_font(None, title_size, bold=True)
    body_font = fitted_font(None, body_size)
    bold_font = fitted_font(None, body_size, bold=True)
    small_font = fitted_font(None, small_size)

    if mode == "square":
        start_y = int(h * 0.30)
    elif mode == "portrait":
        start_y = int(h * 0.245)
    else:
        start_y = int(h * 0.24)
    end_y = draw_wrapped(draw, title, (margin, start_y), title_font, rgb(WHITE), w - 2 * margin, 12)
    end_y = draw_wrapped(draw, subtitle, (margin, end_y + 18), body_font, rgb(MUTED), w - 2 * margin, 10)

    list_y = end_y + int(h * 0.055)
    gap = int(h * (0.052 if mode == "status" else (0.046 if mode == "portrait" else 0.060)))
    for i, benefit in enumerate(benefits):
        draw.rounded_rectangle((margin, list_y + 8, margin + 14, list_y + 22), radius=5, fill=rgb(CYAN if i % 2 else GREEN))
        list_y = draw_wrapped(draw, benefit, (margin + 32, list_y), bold_font, rgb(WHITE), w - 2 * margin - 32, 8) + gap

    cta_h = int(h * 0.08)
    cta_y = min(list_y + int(h * 0.02), h - margin - cta_h - int(h * 0.055))
    draw.rounded_rectangle((margin, cta_y, w - margin, cta_y + cta_h), radius=int(cta_h * 0.22), fill=rgb(GREEN))
    cta_font = fitted_font(None, int(w * 0.031), bold=True)
    bbox = draw.textbbox((0, 0), cta, font=cta_font)
    cta_w = bbox[2] - bbox[0]
    draw.text(((w - cta_w) / 2, cta_y + (cta_h - (bbox[3] - bbox[1])) / 2 - bbox[1]), cta, font=cta_font, fill=rgb(BG))

    footer = "Funciones sujetas a módulos y configuración del club"
    draw.text((margin, h - margin - small_size - 6), footer, font=small_font, fill=rgb(MUTED))
    im.save(OUT_MARKETING / filename, format="PNG", optimize=True)


def build_social_images():
    marketing_art(
        (1080, 1080),
        "El club, mejor organizado",
        "Herramientas para conectar la gestión deportiva y administrativa.",
        ["Jugadores, fichas y categorías", "Agenda, partidos y convocatorias", "Rendimiento, cobros y familias"],
        "Solicita una demostración",
        "facebook_feed_square_1080.png",
        "square",
    )
    marketing_art(
        (1080, 1350),
        "El club, mejor organizado",
        "SportCoreOS reúne herramientas para el trabajo deportivo y administrativo.",
        ["Organiza jugadores y categorías", "Coordina entrenamientos y convocatorias", "Consulta seguimiento físico y telemetría", "Gestiona cobros y espacios deportivos"],
        "Conoce SportCoreOS",
        "instagram_feed_portrait_1080x1350.png",
        "portrait",
    )
    marketing_art(
        (1080, 1920),
        "¿Cómo se organiza hoy tu club?",
        "Conoce una plataforma digital para coordinar la gestión deportiva y administrativa.",
        ["Deportistas y categorías", "Calendario y convocatorias", "Seguimiento del deportista", "Administración y portal familiar"],
        "Agenda una demostración",
        "whatsapp_status_vertical_1080x1920.png",
        "status",
    )


PAGE_W, PAGE_H = A4
INK = colors.HexColor(BG)
PANEL = colors.HexColor(SURFACE)
TEXT = colors.HexColor(WHITE)
SUBTEXT = colors.HexColor(MUTED)
ACCENT = colors.HexColor(GREEN)
ACCENT2 = colors.HexColor(CYAN)


def draw_text_block(c, text, x, y, width, font="Helvetica", size=12, leading=18, color=TEXT):
    c.setFillColor(color)
    c.setFont(font, size)
    lines = []
    current = ""
    for word in text.split():
        candidate = f"{current} {word}".strip()
        if stringWidth(candidate, font, size) <= width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def draw_bullet(c, text, x, y, width, size=12):
    c.setFillColor(ACCENT2)
    c.circle(x + 3, y + 3, 3, fill=1, stroke=0)
    return draw_text_block(c, text, x + 16, y, width - 16, size=size, leading=17, color=TEXT) - 7


def page_base(c, section, page_num):
    c.setFillColor(INK)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(ACCENT)
    c.rect(0, PAGE_H - 11, PAGE_W, 11, fill=1, stroke=0)
    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(48, PAGE_H - 42, section.upper())
    c.setStrokeColor(colors.HexColor("#374151"))
    c.line(48, 40, PAGE_W - 48, 40)
    c.setFillColor(SUBTEXT)
    c.setFont("Helvetica", 8)
    c.drawString(48, 25, "SportCoreOS  |  Presentación de capacidades de plataforma")
    c.drawRightString(PAGE_W - 48, 25, str(page_num))


def page_title(c, title, subtitle=None, y=PAGE_H - 92):
    draw_text_block(c, title, 48, y, PAGE_W - 96, font="Helvetica-Bold", size=25, leading=30)
    if subtitle:
        draw_text_block(c, subtitle, 48, y - 42, PAGE_W - 96, size=11, leading=16, color=SUBTEXT)


def build_portfolio():
    OUT_PDF.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT_PDF), pagesize=A4, pageCompression=1)
    c.setTitle("Portafolio de servicios SportCoreOS")
    c.setAuthor("SportCoreOS")

    # Page 1: cover
    c.setFillColor(INK)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(ACCENT)
    c.rect(0, PAGE_H - 12, PAGE_W, 12, fill=1, stroke=0)
    c.drawImage(str(BRAND), PAGE_W - 294, PAGE_H - 360, width=250, height=250, preserveAspectRatio=True, anchor="c", mask="auto")
    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, PAGE_H - 102, "PLATAFORMA PARA CLUBES Y ESCUELAS DEPORTIVAS")
    draw_text_block(c, "SportCoreOS", 50, PAGE_H - 178, 410, font="Helvetica-Bold", size=34, leading=40)
    draw_text_block(c, "Gestión deportiva y administrativa para el día a día del club", 50, PAGE_H - 224, 300, font="Helvetica-Bold", size=19, leading=26, color=TEXT)
    draw_text_block(c, "Jugadores, equipos, seguimiento deportivo y procesos del club en un entorno digital.", 50, PAGE_H - 330, 285, size=12, leading=18, color=SUBTEXT)
    c.setFillColor(PANEL)
    c.roundRect(50, 98, PAGE_W - 100, 94, 14, fill=1, stroke=0)
    draw_text_block(c, "Una demostración permite recorrer los módulos que mejor se ajustan a la operación y etapa de cada club.", 70, 160, PAGE_W - 140, font="Helvetica-Bold", size=13, leading=19)
    c.setFillColor(SUBTEXT)
    c.setFont("Helvetica", 8)
    c.drawString(50, 55, "La disponibilidad de funciones depende de los módulos activos y su configuración.")
    c.showPage()

    # Page 2
    page_base(c, "SportCoreOS", 2)
    page_title(c, "Un entorno digital para la operación del club", "La plataforma agrupa procesos deportivos y administrativos con acceso según el perfil habilitado.")
    y = PAGE_H - 205
    groups = [
        ("Gestión de planteles", "Organiza deportistas, fichas y categorías para dar contexto al trabajo de cada equipo."),
        ("Agenda y competencia", "Consulta partidos y prepara convocatorias desde la operación deportiva del club."),
        ("Seguimiento deportivo", "Reúne módulos de biometría, pruebas, telemetría GPS y scouting para apoyar el trabajo técnico."),
        ("Administración y familias", "Incluye áreas para cobros, escenarios, servicios deportivos y portal móvil para padres."),
    ]
    for heading, body in groups:
        c.setFillColor(ACCENT)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(52, y, heading)
        y = draw_text_block(c, body, 52, y - 25, PAGE_W - 105, size=12, leading=18, color=TEXT) - 27
    c.setFillColor(PANEL)
    c.roundRect(48, 73, PAGE_W - 96, 88, 12, fill=1, stroke=0)
    draw_text_block(c, "La estructura de acceso por roles permite que cada persona consulte las áreas que corresponden a su función.", 66, 131, PAGE_W - 132, font="Helvetica-Bold", size=11, leading=16, color=TEXT)
    c.showPage()

    # Page 3
    page_base(c, "Gestión deportiva", 3)
    page_title(c, "Planteles, categorías y competencia", "Información para coordinar la actividad del equipo a lo largo de la temporada.")
    y = PAGE_H - 205
    bullets = [
        "Registro y consulta de jugadores y fichas deportivas.",
        "Organización de categorías y divisiones.",
        "Calendario de partidos y fixture.",
        "Preparación de convocatorias y seguimiento de confirmaciones disponibles en el módulo.",
        "Consulta de asistencia y actividad del equipo según la configuración del club.",
    ]
    for item in bullets:
        y = draw_bullet(c, item, 54, y, PAGE_W - 110, size=12)
    c.setFillColor(PANEL)
    c.roundRect(48, 91, PAGE_W - 96, 104, 12, fill=1, stroke=0)
    draw_text_block(c, "Beneficio para el club", 66, 166, PAGE_W - 132, font="Helvetica-Bold", size=13, leading=18, color=ACCENT)
    draw_text_block(c, "Una referencia común para consultar el plantel y preparar la actividad deportiva, en lugar de depender de información dispersa.", 66, 139, PAGE_W - 132, size=11, leading=16, color=TEXT)
    c.showPage()

    # Page 4
    page_base(c, "Seguimiento deportivo", 4)
    page_title(c, "Herramientas para acompañar la evolución", "El cuerpo técnico mantiene el criterio sobre qué medir y cómo interpretar cada dato.")
    y = PAGE_H - 205
    bullets = [
        "Biometría y pruebas físicas para registrar mediciones del deportista.",
        "Telemetría GPS y carga de sesiones cuando el club dispone de los datos y dispositivos correspondientes.",
        "Scouting y visorías para documentar observaciones y procesos de captación.",
        "Copiloto de inteligencia artificial como apoyo de consulta dentro del flujo técnico habilitado.",
    ]
    for item in bullets:
        y = draw_bullet(c, item, 54, y, PAGE_W - 110, size=12)
    c.setFillColor(colors.HexColor("#122A2D"))
    c.roundRect(48, 89, PAGE_W - 96, 116, 12, fill=1, stroke=0)
    draw_text_block(c, "Uso responsable", 66, 173, PAGE_W - 132, font="Helvetica-Bold", size=13, leading=18, color=ACCENT2)
    draw_text_block(c, "Estas herramientas organizan información para apoyar la labor deportiva. No sustituyen una valoración profesional ni deben presentarse como diagnóstico médico.", 66, 145, PAGE_W - 132, size=11, leading=16, color=TEXT)
    c.showPage()

    # Page 5
    page_base(c, "Administración del club", 5)
    page_title(c, "Procesos administrativos y recursos", "Módulos para acompañar la gestión cotidiana del club.")
    y = PAGE_H - 205
    bullets = [
        "Gestión de cobros, pensiones y estados de recaudo.",
        "Administración de canchas y escenarios deportivos.",
        "Tienda oficial, kits y servicios deportivos según la configuración activa.",
        "Accesos por perfil para separar responsabilidades de consulta y operación.",
    ]
    for item in bullets:
        y = draw_bullet(c, item, 54, y, PAGE_W - 110, size=12)
    c.setFillColor(PANEL)
    c.roundRect(48, 87, PAGE_W - 96, 113, 12, fill=1, stroke=0)
    draw_text_block(c, "Nota sobre pagos", 66, 166, PAGE_W - 132, font="Helvetica-Bold", size=13, leading=18, color=GOLD)
    draw_text_block(c, "La disponibilidad de pasarelas, medios de pago y conciliaciones debe confirmarse con el club para cada implementación.", 66, 138, PAGE_W - 132, size=11, leading=16, color=TEXT)
    c.showPage()

    # Page 6
    page_base(c, "Experiencia de familias", 6)
    page_title(c, "Una experiencia digital conectada al club", "El portal móvil para padres ofrece un espacio asociado a la actividad deportiva de sus hijos.")
    draw_text_block(c, "La experiencia familiar puede complementar la coordinación del club al acercar información relevante a los acudientes desde un canal digital.", 52, PAGE_H - 205, PAGE_W - 104, font="Helvetica-Bold", size=16, leading=23, color=TEXT)
    y = PAGE_H - 315
    for item in [
        "Acceso desde dispositivos móviles al portal habilitado.",
        "Consulta de información disponible según perfil y configuración.",
        "Una base para presentar al club una experiencia más organizada para las familias.",
    ]:
        y = draw_bullet(c, item, 54, y, PAGE_W - 110, size=12)
    c.setFillColor(PANEL)
    c.roundRect(48, 84, PAGE_W - 96, 124, 12, fill=1, stroke=0)
    draw_text_block(c, "Protección de datos", 66, 174, PAGE_W - 132, font="Helvetica-Bold", size=13, leading=18, color=ACCENT)
    draw_text_block(c, "El club debe definir responsables, permisos y autorizaciones aplicables al tratar información de deportistas menores de edad.", 66, 145, PAGE_W - 132, size=11, leading=16, color=TEXT)
    c.showPage()

    # Page 7
    page_base(c, "Siguiente paso", 7)
    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, PAGE_H - 105, "SPORTCOREOS PARA TU CLUB")
    draw_text_block(c, "Una demostración basada en la operación real de tu escuela", 50, PAGE_H - 167, PAGE_W - 100, font="Helvetica-Bold", size=28, leading=34, color=TEXT)
    draw_text_block(c, "La conversación comienza por las necesidades del club. Después recorremos únicamente los módulos pertinentes y confirmamos su disponibilidad.", 50, PAGE_H - 265, PAGE_W - 100, size=13, leading=19, color=SUBTEXT)
    c.setFillColor(PANEL)
    c.roundRect(50, 250, PAGE_W - 100, 132, 14, fill=1, stroke=0)
    draw_text_block(c, "Solicita una demostración personalizada", 72, 342, PAGE_W - 144, font="Helvetica-Bold", size=18, leading=24, color=ACCENT)
    draw_text_block(c, "Recorrido sugerido: gestión de planteles, agenda deportiva, seguimiento y procesos administrativos de interés para tu equipo.", 72, 310, PAGE_W - 144, size=12, leading=18, color=TEXT)
    draw_text_block(c, "Funciones, integraciones y condiciones comerciales sujetas a validación con SportCoreOS.", 50, 190, PAGE_W - 100, size=10, leading=14, color=SUBTEXT)
    c.save()


if __name__ == "__main__":
    build_social_images()
    build_portfolio()
    print(f"Created social images in {OUT_MARKETING}")
    print(f"Created portfolio at {OUT_PDF}")
