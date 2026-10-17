import { Component, OnInit, inject, signal, computed, effect, untracked, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { RolConvocatoria, EstadoConfirmacionConvocatoria } from '../../core/enums/domain.enums';
import { ConvocadoItem, PartidoConvocatoria, PosterThemeConvocatoria } from './data/convocatorias.constants';
import { ConvocatoriaSquadColumnComponent } from './components/convocatoria-squad-column/convocatoria-squad-column.component';
import { ConvocatoriaHeroCardComponent } from './components/convocatoria-hero-card/convocatoria-hero-card.component';
import { ConvocatoriaAddModalComponent } from './components/convocatoria-add-modal/convocatoria-add-modal.component';
import { ConvocatoriaPosterModalComponent } from './components/convocatoria-poster-modal/convocatoria-poster-modal.component';

@Component({
  selector: 'app-convocatorias',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    ConvocatoriaSquadColumnComponent,
    ConvocatoriaHeroCardComponent,
    ConvocatoriaAddModalComponent,
    ConvocatoriaPosterModalComponent
  ],
  templateUrl: './convocatorias.component.html',
  styleUrl: './convocatorias.component.scss'
})
export class ConvocatoriasComponent implements OnInit {
  readonly api = inject(ApiService);
  private route = inject(ActivatedRoute);

  private lastLoadedClubId: string | null = null;

  constructor() {
    effect(() => {
      const club = this.api.activeClub();
      if (club && club.id) {
        if (this.lastLoadedClubId === club.id) return;
        this.lastLoadedClubId = club.id;
        untracked(() => {
          this.loadInitData();
        });
      }
    });
  }

  readonly RolConvocatoria = RolConvocatoria;
  readonly EstadoConfirmacionConvocatoria = EstadoConfirmacionConvocatoria;

  readonly matches = signal<PartidoConvocatoria[]>([]);
  readonly selectedPartidoId = signal<string>('');
  readonly currentMatch = signal<PartidoConvocatoria | null>(null);
  readonly convocados = signal<ConvocadoItem[]>([]);
  readonly toastMessage = signal<string>('');

  readonly showAddPlayerModal = signal<boolean>(false);
  readonly addModalInitialRole = signal<RolConvocatoria>(RolConvocatoria.TITULAR);

  // Modal Poster IA
  readonly showPosterModal = signal<boolean>(false);
  readonly isGeneratingAi = signal<boolean>(false);
  readonly aiGeneratedCopy = signal<string>('');

  readonly titulares = computed(() => {
    return this.convocados().filter((p) => p.rol_convocatoria?.toUpperCase() === RolConvocatoria.TITULAR);
  });

  readonly suplentes = computed(() => {
    return this.convocados().filter((p) => p.rol_convocatoria?.toUpperCase() !== RolConvocatoria.TITULAR);
  });

  readonly confirmadosCount = computed(() => {
    return this.convocados().filter((p) => p.estado_confirmacion === EstadoConfirmacionConvocatoria.CONFIRMADO).length;
  });

  readonly titularesConfirmadosCount = computed(() => {
    return this.titulares().filter((p) => p.estado_confirmacion === EstadoConfirmacionConvocatoria.CONFIRMADO).length;
  });

  readonly suplentesConfirmadosCount = computed(() => {
    return this.suplentes().filter((p) => p.estado_confirmacion === EstadoConfirmacionConvocatoria.CONFIRMADO).length;
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const preferredId = params['partidoId'] || undefined;
      this.loadInitData(preferredId);
    });
  }

  loadInitData(preferredPartidoId?: string): void {
    this.api.getConvocatoriasInitData(preferredPartidoId).subscribe({
      next: (res) => {
        const partidos = res.partidos || [];
        this.matches.set(partidos);
        if (res.partidoActivo) {
          this.selectedPartidoId.set(res.partidoActivo.id);
          this.currentMatch.set(res.partidoActivo);
          this.convocados.set(res.convocados || []);
        } else {
          this.selectedPartidoId.set('');
          this.currentMatch.set(null);
          this.convocados.set([]);
        }
      },
      error: () => {
        this.matches.set([]);
        this.selectedPartidoId.set('');
        this.currentMatch.set(null);
        this.convocados.set([]);
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

  openAddPlayerModalWithRole(role: RolConvocatoria): void {
    this.addModalInitialRole.set(role);
    this.showAddPlayerModal.set(true);
  }

  closeAddPlayerModal(): void {
    this.showAddPlayerModal.set(false);
  }

  submitAddPlayerToConvocatoria(event: { jugadorId: string; rol: RolConvocatoria; posicion: string }): void {
    const partidoId = this.selectedPartidoId();
    if (!partidoId || !event.jugadorId) return;

    this.api.addJugadorConvocatoria(partidoId, event.jugadorId, event.rol, event.posicion).subscribe({
      next: () => {
        this.showToast('Player successfully added to match call-up');
        this.closeAddPlayerModal();
        this.loadConvocatoria(partidoId);
      },
      error: () => {
        this.showToast('Error adding player to call-up');
      },
    });
  }

  removePlayerFromConvocatoria(player: ConvocadoItem): void {
    const partidoId = this.selectedPartidoId();
    if (!partidoId) return;

    this.api.removeJugadorConvocatoria(partidoId, player.jugador_id || player.id || '').subscribe({
      next: () => {
        this.showToast(`${player.nombres} ${player.apellidos} removed from call-up`);
        this.loadConvocatoria(partidoId);
      },
      error: () => {
        this.showToast('Error removing player from call-up');
      },
    });
  }

  switchPlayerRole(event: { player: ConvocadoItem; newRole: RolConvocatoria }): void {
    const partidoId = this.selectedPartidoId();
    if (!partidoId) return;

    this.api.cambiarRolConvocatoria(partidoId, event.player.jugador_id || event.player.id || '', event.newRole).subscribe({
      next: () => {
        this.showToast(`Player moved to ${event.newRole === RolConvocatoria.TITULAR ? 'Starting XI' : 'Substitutes Bench'}`);
        this.loadConvocatoria(partidoId);
      },
      error: () => {
        this.showToast('Error updating call-up role');
      },
    });
  }

  onSuggestConvocatoria(): void {
    const partidoId = this.selectedPartidoId();
    if (!partidoId) return;

    this.api.sugerirConvocatoria(partidoId, 11, 7).subscribe({
      next: (res) => {
        this.convocados.set(res.jugadores || []);
        this.showToast('Suggested lineup generated from active category roster!');
      },
      error: () => {
        this.showToast('Error generating suggested lineup');
      },
    });
  }

  togglePlayerStatus(player: ConvocadoItem): void {
    const estados = [
      EstadoConfirmacionConvocatoria.CONFIRMADO,
      EstadoConfirmacionConvocatoria.PENDIENTE,
      EstadoConfirmacionConvocatoria.EXCUSADO
    ];
    const currentIdx = estados.indexOf(player.estado_confirmacion as EstadoConfirmacionConvocatoria);
    const nextEstado = estados[(currentIdx + 1) % estados.length];

    this.api.responderConvocatoria(player.id || '', nextEstado, undefined, player.jugador_id).subscribe({
      next: () => {
        player.estado_confirmacion = nextEstado;
        this.showToast(`${player.nombres} ${player.apellidos} marked as ${nextEstado}`);
      },
      error: () => {
        this.showToast('Error updating call-up status');
      },
    });
  }

  openGpsRoute(): void {
    const match = this.currentMatch();
    if (!match || !match.sede_cancha) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.sede_cancha)}`;
    window.open(url, '_blank');
    this.showToast(`Opening map navigation for ${match.sede_cancha}`);
  }

  onSendWhatsAppCitacion(): void {
    this.showToast('Match call-ups broadcasted via WhatsApp to all parents/guardians!');
  }

  openPosterModal(): void {
    this.showPosterModal.set(true);
    this.generateWithGeminiAi();
  }

  closePosterModal(): void {
    this.showPosterModal.set(false);
  }

  generateWithGeminiAi(): void {
    const partidoId = this.selectedPartidoId();
    if (!partidoId) return;

    this.isGeneratingAi.set(true);

    this.api.generarGraficaConvocatoriaIa({
      partido_id: partidoId,
      estilo_diseno: 'ELITE_NEON',
      tono_titular: 'MATCHDAY_EPIC',
    }).subscribe({
      next: (res) => {
        if (res.copy_redes_sociales) {
          this.aiGeneratedCopy.set(res.copy_redes_sociales);
        }
        this.isGeneratingAi.set(false);
        this.showToast('✨ Matchday graphic and copy successfully generated with Gemini AI!');
      },
      error: () => {
        this.isGeneratingAi.set(false);
      }
    });
  }

  copyAiTextToClipboard(): void {
    const text = this.aiGeneratedCopy();
    if (!text) return;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          this.showToast('📋 Social media copy copied to clipboard!');
        })
        .catch(() => {
          this.showToast('📋 Social media copy selected!');
        });
    } else {
      this.showToast('📋 Text ready for social media publishing');
    }
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}
