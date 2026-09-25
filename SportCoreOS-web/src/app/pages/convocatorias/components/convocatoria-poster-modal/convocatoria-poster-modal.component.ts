import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConvocadoItem, PartidoConvocatoria, POSTER_THEME_OPTIONS, PosterThemeConvocatoria } from '../../data/convocatorias.constants';

@Component({
  selector: 'app-convocatoria-poster-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './convocatoria-poster-modal.component.html',
  styleUrls: ['./convocatoria-poster-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConvocatoriaPosterModalComponent implements AfterViewInit {
  @Input({ required: true }) match: PartidoConvocatoria | null = null;
  @Input({ required: true }) convocados: ConvocadoItem[] = [];
  @Input({ required: true }) activeClub: { nombre: string; sigla: string } = { nombre: '', sigla: '' };
  @Input() isGeneratingAi: boolean = false;
  @Input() aiGeneratedCopy: string = '';

  @Output() close = new EventEmitter<void>();
  @Output() regenerateAi = new EventEmitter<void>();
  @Output() copyAiText = new EventEmitter<void>();

  @ViewChild('posterCanvas') posterCanvasRef!: ElementRef<HTMLCanvasElement>;

  readonly themeOptions = POSTER_THEME_OPTIONS;

  posterTheme: PosterThemeConvocatoria = PosterThemeConvocatoria.EMERALD;
  posterHeadline: string = '¡CONVOCATORIA OFICIAL!';
  posterHashtag: string = '#VamosPorLaVictoria #SportCoreOS';

  ngAfterViewInit(): void {
    setTimeout(() => this.drawSocialPoster(), 50);
  }

  onThemeChange(theme: PosterThemeConvocatoria): void {
    this.posterTheme = theme;
    this.drawSocialPoster();
  }

  drawSocialPoster(): void {
    if (!this.posterCanvasRef) return;
    const canvas = this.posterCanvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensiones de poster para redes (Formato 4:5 vertical 1080x1350)
    canvas.width = 1080;
    canvas.height = 1350;

    // Colores según tema
    let gradTop = '#064e3b';
    let gradBot = '#022c22';
    let accentColor = '#10b981';
    let goldColor = '#f59e0b';

    if (this.posterTheme === PosterThemeConvocatoria.DARK_GOLD) {
      gradTop = '#18181b';
      gradBot = '#09090b';
      accentColor = '#f59e0b';
      goldColor = '#fbbf24';
    } else if (this.posterTheme === PosterThemeConvocatoria.CYBER_BLUE) {
      gradTop = '#0f172a';
      gradBot = '#020617';
      accentColor = '#06b6d4';
      goldColor = '#38bdf8';
    } else if (this.posterTheme === PosterThemeConvocatoria.FUTURISTIC_RED) {
      gradTop = '#450a0a';
      gradBot = '#1c0404';
      accentColor = '#ef4444';
      goldColor = '#f87171';
    }

    // 1. Fondo Gradiente
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, gradTop);
    grad.addColorStop(1, gradBot);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Patrón de diseño / Marca de agua
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    for (let i = 0; i < canvas.width; i += 60) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 200, canvas.height);
      ctx.stroke();
    }

    // 3. Encabezado Oficial
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 38px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.activeClub.nombre?.toUpperCase() || 'ACADEMIA DEPORTIVA', canvas.width / 2, 80);

    // Titular Convocatoria
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 64px Inter, sans-serif';
    ctx.fillText(this.posterHeadline, canvas.width / 2, 160);

    // Subtítulo Categoría
    ctx.fillStyle = goldColor;
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillText((this.match?.categoria_nombre || 'CATEGORÍA COMPETITIVA').toUpperCase(), canvas.width / 2, 210);

    // 4. Banner Matchday VS
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(80, 240, canvas.width - 160, 160, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(this.activeClub.sigla || 'LOCAL', 130, 310);

    ctx.fillStyle = goldColor;
    ctx.font = '900 48px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VS', canvas.width / 2, 335);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(this.match?.rival_nombre?.substring(0, 14) || 'RIVAL', canvas.width - 130, 310);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`📅 ${this.match?.fecha_partido || ''} • ⏰ ${this.match?.hora_partido || ''} • 📍 ${this.match?.sede_cancha || 'Sede Principal'}`, canvas.width / 2, 375);

    // 5. Lista de Convocados (Titulares y Suplentes)
    const titulares = this.convocados.filter(c => c.rol_convocatoria?.toUpperCase() === 'TITULAR');
    const suplentes = this.convocados.filter(c => c.rol_convocatoria?.toUpperCase() !== 'TITULAR');

    // Columna Titulares
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🟢 ONCE TITULAR', 90, 460);

    ctx.font = '600 26px Inter, sans-serif';
    titulares.forEach((p, idx) => {
      if (idx < 11) {
        const y = 510 + (idx * 45);
        ctx.fillStyle = goldColor;
        ctx.fillText(`#${p.numero_dorsal || idx + 1}`, 90, y);
        ctx.fillStyle = '#ffffff';
        const nombre = `${p.nombres} ${p.apellidos}`.substring(0, 22);
        ctx.fillText(nombre, 150, y);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '20px Inter, sans-serif';
        ctx.fillText(p.posicion_designada || p.posicion_principal || '', 420, y);
        ctx.font = '600 26px Inter, sans-serif';
      }
    });

    // Columna Suplentes
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🔵 BANCO DE SUPLENTES', 580, 460);

    ctx.font = '600 26px Inter, sans-serif';
    suplentes.forEach((p, idx) => {
      if (idx < 10) {
        const y = 510 + (idx * 45);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`#${p.numero_dorsal || idx + 12}`, 580, y);
        ctx.fillStyle = '#ffffff';
        const nombre = `${p.nombres} ${p.apellidos}`.substring(0, 20);
        ctx.fillText(nombre, 640, y);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '20px Inter, sans-serif';
        ctx.fillText(p.posicion_designada || p.posicion_principal || '', 890, y);
        ctx.font = '600 26px Inter, sans-serif';
      }
    });

    // 6. Pie de gráfica con Branding
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, canvas.height - 120, canvas.width, 120);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.posterHashtag, canvas.width / 2, canvas.height - 65);

    ctx.fillStyle = '#64748b';
    ctx.font = '20px Inter, sans-serif';
    ctx.fillText('Convocatoria oficial validada con SportCoreOS Ecosystem', canvas.width / 2, canvas.height - 25);
  }

  downloadPosterImage(): void {
    if (!this.posterCanvasRef) return;
    const canvas = this.posterCanvasRef.nativeElement;
    const link = document.createElement('a');
    link.download = `Convocatoria_${this.match?.rival_nombre || 'Match'}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}
