import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { PlayerSelectorComponent } from '../../shared/components/player-selector/player-selector.component';

@Component({
  selector: 'app-convocatorias',
  standalone: true,
  imports: [CommonModule, FormsModule, PlayerSelectorComponent],
  templateUrl: './convocatorias.component.html',
  styleUrl: './convocatorias.component.scss'
})
export class ConvocatoriasComponent implements OnInit {
  api = inject(ApiService);
  private route = inject(ActivatedRoute);

  readonly matches = signal<any[]>([]);
  readonly selectedPartidoId = signal<string>('');
  readonly currentMatch = signal<any | null>(null);
  readonly convocados = signal<any[]>([]);
  readonly toastMessage = signal<string>('');

  readonly showAddPlayerModal = signal<boolean>(false);
  readonly selectedPlayerToConvocate = signal<string>('');
  newConvocadoRole = 'TITULAR';
  newConvocadoPos = '';

  readonly titulares = computed(() => {
    return this.convocados().filter((p) => p.rol_convocatoria?.toUpperCase() === 'TITULAR');
  });

  readonly suplentes = computed(() => {
    return this.convocados().filter((p) => p.rol_convocatoria?.toUpperCase() !== 'TITULAR');
  });

  readonly confirmadosCount = computed(() => {
    return this.convocados().filter((p) => p.estado_confirmacion === 'CONFIRMADO').length;
  });

  readonly titularesConfirmadosCount = computed(() => {
    return this.titulares().filter((p) => p.estado_confirmacion === 'CONFIRMADO').length;
  });

  readonly suplentesConfirmadosCount = computed(() => {
    return this.suplentes().filter((p) => p.estado_confirmacion === 'CONFIRMADO').length;
  });

  ngOnInit(): void {
    this.api.getPartidos().subscribe((data) => {
      const partidos = Array.isArray(data) ? data : (data?.data || []);
      this.matches.set(partidos);
      if (partidos && partidos.length > 0) {
        this.route.queryParams.subscribe((params) => {
          const targetId = params['partidoId'] || partidos[0].id;
          this.selectedPartidoId.set(targetId);
          this.loadConvocatoria(targetId);
        });
      }
    });
  }

  onSelectPartido(partidoId: string): void {
    this.selectedPartidoId.set(partidoId);
    this.loadConvocatoria(partidoId);
  }

  loadConvocatoria(partidoId: string): void {
    this.api.getConvocatoria(partidoId).subscribe((res) => {
      this.currentMatch.set(res.partido);
      this.convocados.set(res.jugadores || []);
    });
  }

  openAddPlayerModal(): void {
    this.selectedPlayerToConvocate.set('');
    this.newConvocadoRole = 'TITULAR';
    this.newConvocadoPos = '';
    this.showAddPlayerModal.set(true);
  }

  openAddPlayerModalWithRole(role: string): void {
    this.selectedPlayerToConvocate.set('');
    this.newConvocadoRole = role;
    this.newConvocadoPos = '';
    this.showAddPlayerModal.set(true);
  }

  closeAddPlayerModal(): void {
    this.showAddPlayerModal.set(false);
  }

  onPlayerSelected(playerOrId: any): void {
    if (!playerOrId) {
      this.selectedPlayerToConvocate.set('');
      return;
    }
    const id = typeof playerOrId === 'string' ? playerOrId : playerOrId?.id;
    if (id) {
      this.selectedPlayerToConvocate.set(id);
      if (typeof playerOrId === 'object' && playerOrId?.posicion_principal) {
        if (!this.newConvocadoPos) {
          this.newConvocadoPos = playerOrId.posicion_principal;
        }
      }
    }
  }

  submitAddPlayerToConvocatoria(): void {
    const partidoId = this.selectedPartidoId();
    const jugadorId = this.selectedPlayerToConvocate();
    if (!partidoId || !jugadorId) return;

    this.api.addJugadorConvocatoria(partidoId, jugadorId, this.newConvocadoRole, this.newConvocadoPos).subscribe({
      next: () => {
        this.showToast('Jugador añadido exitosamente a la convocatoria');
        this.closeAddPlayerModal();
        this.loadConvocatoria(partidoId);
      },
      error: () => {
        this.showToast('Error al añadir jugador a la convocatoria');
      },
    });
  }

  removePlayerFromConvocatoria(player: any): void {
    const partidoId = this.selectedPartidoId();
    if (!partidoId) return;

    this.api.removeJugadorConvocatoria(partidoId, player.jugador_id || player.id).subscribe({
      next: () => {
        this.showToast(`${player.nombres} ${player.apellidos} retirado de la convocatoria`);
        this.loadConvocatoria(partidoId);
      },
      error: () => {
        this.showToast('Error al desconvocar al jugador');
      },
    });
  }

  switchPlayerRole(player: any, newRole: string): void {
    const partidoId = this.selectedPartidoId();
    if (!partidoId) return;

    this.api.cambiarRolConvocatoria(partidoId, player.jugador_id || player.id, newRole).subscribe({
      next: () => {
        this.showToast(`Jugador movido a ${newRole === 'TITULAR' ? 'Once Titular' : 'Banco de Suplentes'}`);
        this.loadConvocatoria(partidoId);
      },
      error: () => {
        this.showToast('Error al cambiar rol de convocatoria');
      },
    });
  }

  onSuggestConvocatoria(): void {
    const partidoId = this.selectedPartidoId();
    if (!partidoId) return;

    this.api.sugerirConvocatoria(partidoId, 11, 7).subscribe({
      next: (res) => {
        this.convocados.set(res.jugadores || []);
        this.showToast('¡Nómina sugerida generada según la nómina activa de la categoría!');
      },
      error: () => {
        this.showToast('Error al generar sugerencia de convocatoria');
      },
    });
  }

  togglePlayerStatus(player: any): void {
    const estados = ['CONFIRMADO', 'PENDIENTE', 'EXCUSADO'];
    const currentIdx = estados.indexOf(player.estado_confirmacion);
    const nextEstado = estados[(currentIdx + 1) % estados.length];

    this.api.responderConvocatoria(player.id, nextEstado, undefined, player.jugador_id).subscribe({
      next: () => {
        player.estado_confirmacion = nextEstado;
        this.showToast(`${player.nombres} ${player.apellidos} marcado como ${nextEstado}`);
      },
      error: () => {
        this.showToast('Error al actualizar estado de convocatoria');
      },
    });
  }

  openGpsRoute(): void {
    const match = this.currentMatch();
    if (!match) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.sede_cancha)}`;
    window.open(url, '_blank');
    this.showToast(`Abriendo mapa para ${match.sede_cancha}`);
  }

  onSendWhatsAppCitacion(): void {
    this.showToast('¡Citaciones enviadas masivamente por WhatsApp a todos los acudientes!');
  }

  // Señales y estado para la generación de imagen / póster con Gemini AI
  readonly showPosterModal = signal<boolean>(false);
  readonly isGeneratingAi = signal<boolean>(false);
  readonly aiGeneratedCopy = signal<string>('');
  @ViewChild('posterCanvas') posterCanvasRef!: ElementRef<HTMLCanvasElement>;
  posterTheme: 'emerald' | 'dark-gold' | 'cyber-blue' | 'futuristic-red' = 'emerald';
  posterHeadline = '¡CONVOCATORIA OFICIAL!';
  posterHashtag = '#VamosPorLaVictoria #SportCoreOS';

  openPosterModal(): void {
    this.showPosterModal.set(true);
    this.generateWithGeminiAi();
  }

  closePosterModal(): void {
    this.showPosterModal.set(false);
  }

  generateWithGeminiAi(): void {
    const partidoId = this.selectedPartidoId();
    if (!partidoId) {
      setTimeout(() => this.drawSocialPoster(), 100);
      return;
    }

    this.isGeneratingAi.set(true);
    const styleMap: Record<string, string> = {
      'emerald': 'ELITE_NEON',
      'dark-gold': 'DARK_GOLD',
      'cyber-blue': 'CYBER_BLUE',
      'futuristic-red': 'FUTURISTIC_RED',
    };

    this.api.generarGraficaConvocatoriaIa({
      partido_id: partidoId,
      estilo_diseno: styleMap[this.posterTheme] || 'ELITE_NEON',
      tono_titular: 'MATCHDAY_EPIC',
    }).subscribe({
      next: (res) => {
        if (res.titular_impacto) {
          this.posterHeadline = res.titular_impacto;
        }
        if (res.hashtags_sugeridos) {
          this.posterHashtag = res.hashtags_sugeridos;
        }
        if (res.copy_redes_sociales) {
          this.aiGeneratedCopy.set(res.copy_redes_sociales);
        }
        this.isGeneratingAi.set(false);
        setTimeout(() => this.drawSocialPoster(), 50);
        this.showToast('✨ ¡Diseño y copy generados exitosamente con Gemini AI!');
      },
      error: () => {
        this.isGeneratingAi.set(false);
        setTimeout(() => this.drawSocialPoster(), 50);
      }
    });
  }

  onThemeChange(newTheme: any): void {
    this.posterTheme = newTheme;
    this.generateWithGeminiAi();
  }

  copyAiTextToClipboard(): void {
    const text = this.aiGeneratedCopy();
    if (!text) return;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          this.showToast('📋 ¡Texto para redes copiado al portapapeles!');
        })
        .catch(() => {
          this.showToast('📋 ¡Texto para redes seleccionado!');
        });
    } else {
      this.showToast('📋 Texto listo para publicar en redes sociales');
    }
  }

  drawSocialPoster(): void {
    const canvas = document.getElementById('posterCanvas') as HTMLCanvasElement || this.posterCanvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuración de Alta Definición (1080 x 1350 px - Ratio 4:5 vertical ideal para Instagram/WhatsApp/Facebook)
    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;

    const club = this.api.activeClub();
    const match = this.currentMatch();
    const titularesList = this.titulares();
    const suplentesList = this.suplentes();

    // 1. PALETA DE COLORES SEGÚN EL TEMA INSTITUCIONAL SELECCIONADO POR GEMINI
    let primaryColor = '#10b981'; // Esmeralda oficial
    let secondaryColor = '#047857';
    let accentGold = '#f59e0b';
    let bgGradientStart = '#060d19';
    let bgGradientEnd = '#0f172a';

    if (this.posterTheme === 'dark-gold') {
      primaryColor = '#f59e0b';
      secondaryColor = '#b45309';
      accentGold = '#fbbf24';
      bgGradientStart = '#0a0a0a';
      bgGradientEnd = '#18181b';
    } else if (this.posterTheme === 'cyber-blue') {
      primaryColor = '#3b82f6';
      secondaryColor = '#1d4ed8';
      accentGold = '#06b6d4';
      bgGradientStart = '#030712';
      bgGradientEnd = '#0f172a';
    } else if (this.posterTheme === 'futuristic-red') {
      primaryColor = '#ef4444';
      secondaryColor = '#991b1b';
      accentGold = '#f97316';
      bgGradientStart = '#180509';
      bgGradientEnd = '#0f172a';
    }

    // 2. FONDO PRINCIPAL CON DEGRADADO Y EFECTOS MULTIMODALES
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, bgGradientStart);
    bgGrad.addColorStop(0.5, bgGradientEnd);
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Textura geométrica deportiva y luces ambientales
    ctx.save();
    // Brillo superior izquierdo
    const glow1 = ctx.createRadialGradient(150, 150, 10, 150, 150, 450);
    glow1.addColorStop(0, `${primaryColor}38`);
    glow1.addColorStop(1, 'transparent');
    ctx.fillStyle = glow1;
    ctx.beginPath();
    ctx.arc(150, 150, 450, 0, Math.PI * 2);
    ctx.fill();

    // Brillo inferior derecho
    const glow2 = ctx.createRadialGradient(W - 150, H - 200, 10, W - 150, H - 200, 500);
    glow2.addColorStop(0, `${secondaryColor}30`);
    glow2.addColorStop(1, 'transparent');
    ctx.fillStyle = glow2;
    ctx.beginPath();
    ctx.arc(W - 150, H - 200, 500, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Líneas de corte dinámicas de fondo
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 4;
    for (let i = -W; i < W * 2; i += 120) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 400, H);
      ctx.stroke();
    }

    // Marco exterior con borde luminoso
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, W - 60, H - 60);

    // 3. HEADER SUPERIOR INSTITUCIONAL
    // Escudo / Badge del Club
    const crestX = 110;
    const crestY = 110;
    const crestRadius = 55;

    ctx.save();
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.arc(crestX, crestY, crestRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 36px "Inter", "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(club.sigla || 'FC', crestX, crestY);
    ctx.restore();

    // Nombre del Club y Badge de Matchday
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 34px "Inter", "Segoe UI", Roboto, sans-serif';
    ctx.fillText(club.nombre.toUpperCase(), 185, 95);

    ctx.fillStyle = primaryColor;
    ctx.font = '700 20px "Inter", "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`TEMPORADA OFICIAL 2026 • ${club.ciudad?.toUpperCase() || 'COLOMBIA'}`, 185, 130);

    // Badge Categoría en esquina superior derecha
    if (match?.categoria_nombre) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;
      const catText = match.categoria_nombre.toUpperCase();
      const badgeW = 240;
      const badgeH = 50;
      const badgeX = W - 300;
      const badgeY = 85;

      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 20px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`⚽ ${catText}`, badgeX + badgeW / 2, badgeY + badgeH / 2);
      ctx.restore();
    }

    // Línea separadora dorada/esmeralda
    const lineGrad = ctx.createLinearGradient(60, 185, W - 60, 185);
    lineGrad.addColorStop(0, 'transparent');
    lineGrad.addColorStop(0.5, primaryColor);
    lineGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, 185);
    ctx.lineTo(W - 60, 185);
    ctx.stroke();

    // 4. TARJETA HERO DEL PARTIDO (VS, FECHA, HORA, SEDE)
    const heroY = 210;
    const heroH = 200;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(60, heroY, W - 120, heroH, 18);
    ctx.fill();
    ctx.stroke();

    // Titular de impacto generado por Gemini
    ctx.textAlign = 'center';
    ctx.fillStyle = accentGold;
    ctx.font = '900 24px "Inter", sans-serif';
    ctx.fillText(this.posterHeadline.toUpperCase(), W / 2, heroY + 36);

    // Enfrentamiento VS
    const team1Name = match?.condicion_juego === 'LOCAL' ? club.nombre : (match?.rival_nombre || 'RIVAL');
    const team2Name = match?.condicion_juego === 'LOCAL' ? (match?.rival_nombre || 'RIVAL') : club.nombre;

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px "Inter", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(team1Name, W / 2 - 60, heroY + 95);

    // Círculo VS
    ctx.save();
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.arc(W / 2, heroY + 87, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 22px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VS', W / 2, heroY + 87);
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(team2Name, W / 2 + 60, heroY + 95);

    // Datos de fecha, hora y sede
    const matchDateStr = match?.fecha_partido ? `📅 ${match.fecha_partido}` : '📅 Próximo Partido';
    const matchTimeStr = match?.hora_partido ? `⏰ Hora Partido: ${match.hora_partido}` : '';
    const matchCitStr = match?.hora_citacion ? `(Citación: ${match.hora_citacion})` : '';
    const matchSedeStr = match?.sede_cancha ? `📍 Sede: ${match.sede_cancha}` : '📍 Cancha Principal';

    ctx.textAlign = 'center';
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '700 20px "Inter", sans-serif';
    ctx.fillText(`${matchDateStr}   •   ${matchTimeStr} ${matchCitStr}`, W / 2, heroY + 145);

    ctx.fillStyle = primaryColor;
    ctx.font = '600 19px "Inter", sans-serif';
    ctx.fillText(matchSedeStr, W / 2, heroY + 175);

    // 5. GRID DE JUGADORES: ONCE TITULAR Y BANCO DE SUPLENTES
    const gridY = 440;
    const colW = (W - 150) / 2; // 465px cada columna

    // --- COLUMNA 1: ONCE TITULAR ---
    const col1X = 60;
    // Header Titulares
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.roundRect(col1X, gridY, colW, 44, 8);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 20px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🟢 ONCE TITULAR (${titularesList.length})`, col1X + 16, gridY + 28);

    // Lista de Titulares
    let currentY = gridY + 65;
    const rowH = 46;

    titularesList.slice(0, 11).forEach((p, idx) => {
      // Fila fondo
      ctx.fillStyle = idx % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)';
      ctx.beginPath();
      ctx.roundRect(col1X, currentY - 8, colW, rowH - 4, 6);
      ctx.fill();

      // Badge dorsal
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.roundRect(col1X + 8, currentY - 3, 34, 30, 4);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 16px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${p.numero_dorsal || (idx + 1)}`, col1X + 25, currentY + 18);

      // Nombre y posición
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 18px "Inter", sans-serif';
      const pName = `${p.nombres} ${p.apellidos}`.slice(0, 24);
      ctx.fillText(pName, col1X + 52, currentY + 15);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 14px "Inter", sans-serif';
      const pPos = (p.posicion_designada || p.posicion_principal || 'Jugador').toUpperCase();
      ctx.fillText(pPos, col1X + 52, currentY + 31);

      currentY += rowH;
    });

    // --- COLUMNA 2: BANCO DE SUPLENTES & CUERPO TÉCNICO ---
    const col2X = col1X + colW + 30;
    // Header Suplentes
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(col2X, gridY, colW, 44, 8);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 20px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🔵 BANCO DE SUPLENTES (${suplentesList.length})`, col2X + 16, gridY + 28);

    // Lista de Suplentes
    let suplenteY = gridY + 65;
    suplentesList.slice(0, 9).forEach((p, idx) => {
      // Fila fondo
      ctx.fillStyle = idx % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)';
      ctx.beginPath();
      ctx.roundRect(col2X, suplenteY - 8, colW, rowH - 4, 6);
      ctx.fill();

      // Badge dorsal
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.roundRect(col2X + 8, suplenteY - 3, 34, 30, 4);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 16px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${p.numero_dorsal || '-'}`, col2X + 25, suplenteY + 18);

      // Nombre y posición
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 18px "Inter", sans-serif';
      const pName = `${p.nombres} ${p.apellidos}`.slice(0, 24);
      ctx.fillText(pName, col2X + 52, suplenteY + 15);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 14px "Inter", sans-serif';
      const pPos = (p.posicion_designada || p.posicion_principal || 'Suplente').toUpperCase();
      ctx.fillText(pPos, col2X + 52, suplenteY + 31);

      suplenteY += rowH;
    });

    // CUERPO TÉCNICO EN COLUMNA 2
    const ctY = Math.max(suplenteY + 15, gridY + (11 * rowH) - 80);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(col2X, ctY, colW, 85, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = accentGold;
    ctx.font = '900 16px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📋 CUERPO TÉCNICO OFICIAL', col2X + 16, ctY + 26);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 15px "Inter", sans-serif';
    ctx.fillText('Director Técnico: Profe Carlos Valderrama', col2X + 16, ctY + 50);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 14px "Inter", sans-serif';
    ctx.fillText('Preparador Físico: Dpto. Rendimiento SportCore', col2X + 16, ctY + 70);

    // 6. FOOTER INFERIOR Y MARCA DE AGUA GEMINI
    const footerY = H - 110;
    // Línea separadora
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, footerY);
    ctx.lineTo(W - 60, footerY);
    ctx.stroke();

    ctx.fillStyle = accentGold;
    ctx.font = '800 18px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(this.posterHashtag, 60, footerY + 45);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 20px "Inter", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('SPORTCORE AI • GEMINI MULTIMODAL', W - 60, footerY + 40);

    ctx.fillStyle = '#64748b';
    ctx.font = '600 14px "Inter", sans-serif';
    ctx.fillText('Diseño Inteligente Generado para Redes Sociales', W - 60, footerY + 62);
  }

  downloadPosterImage(): void {
    const canvas = document.getElementById('posterCanvas') as HTMLCanvasElement || this.posterCanvasRef?.nativeElement;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const match = this.currentMatch();
    const club = this.api.activeClub();
    const catName = match?.categoria_nombre?.replace(/\s+/g, '_') || 'Categoria';
    const rivalName = match?.rival_nombre?.replace(/\s+/g, '_') || 'Rival';
    
    link.download = `Convocatoria_GeminiAI_${club.sigla || 'Club'}_vs_${rivalName}_${catName}.png`;
    link.href = dataUrl;
    link.click();

    this.showToast('¡Póster HD generado por Gemini AI descargado con éxito!');
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}

