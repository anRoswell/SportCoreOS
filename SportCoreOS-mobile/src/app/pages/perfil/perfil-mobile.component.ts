import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';

export interface InsigniaDeportista {
  id: string;
  nombre: string;
  clinica_titulo: string;
  categoria: string;
  icono: string;
  color_tema: string;
  fecha_obtencion?: string;
  entrenador_nombre: string;
  cancha_nombre: string;
  nivel: string; // 'Oro', 'Plata', 'Diamante', 'Élite'
  desbloqueada: boolean;
  puntaje_evaluacion?: number;
  metrica_clave?: string;
  descripcion: string;
}

@Component({
  selector: 'app-perfil-mobile',
  standalone: true,
  imports: [CommonModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './perfil-mobile.component.html',
  styleUrl: './perfil-mobile.component.scss'
})
export class PerfilMobileComponent implements OnInit {
  authService = inject(AuthService);
  private alertService = inject(AlertService);

  currentUser = this.authService.currentUser;

  // Signal filter state
  filtroInsignias = signal<'TODAS' | 'DESBLOQUEADAS' | 'BLOQUEADAS'>('TODAS');
  selectedInsignia = signal<InsigniaDeportista | null>(null);

  // List of official specialized clinic badges
  insigniasList = signal<InsigniaDeportista[]>([
    {
      id: 'ins-1',
      nombre: '⚡ Rayo de 5 Metros',
      clinica_titulo: 'Explosividad & Sprint Pura para Niños',
      categoria: 'VELOCIDAD',
      icono: 'fa-bolt',
      color_tema: '#10b981',
      fecha_obtencion: '15 Sep 2026',
      entrenador_nombre: 'Prof. Reinaldo Rueda',
      cancha_nombre: 'Cancha de Fútbol Alameda La Victoria',
      nivel: '🥇 Nivel Oro',
      desbloqueada: true,
      puntaje_evaluacion: 96,
      metrica_clave: '1.12s en 5m (Top 5% Academia)',
      descripcion: 'Dominio absoluto de salida explosiva, centro de gravedad bajo y aceleración inicial medida por sensores láser Doppler.'
    },
    {
      id: 'ins-2',
      nombre: '🧠 Mente de Gran Maestro',
      clinica_titulo: 'Coordinación & Neuro-Agilidad Fitlight',
      categoria: 'NEURO-AGILIDAD',
      icono: 'fa-brain',
      color_tema: '#06b6d4',
      fecha_obtencion: '08 Sep 2026',
      entrenador_nombre: 'Dra. Marcela Gómez (Neuro-Deporte)',
      cancha_nombre: 'Complejo Deportivo Los Calamares',
      nivel: '💎 Nivel Platino',
      desbloqueada: true,
      puntaje_evaluacion: 98,
      metrica_clave: '0.24s tiempo de reacción visual',
      descripcion: 'Agilidad mental y toma de decisiones de alta velocidad con estímulos lumínicos Fitlight bajo fatiga inducida.'
    },
    {
      id: 'ins-3',
      nombre: '🪄 Maestro del Engaño 1v1',
      clinica_titulo: 'Técnica de Regate & Duelos 1v1 Vinicius Jr',
      categoria: 'REGATE & DUELOS',
      icono: 'fa-wand-magic-sparkles',
      color_tema: '#f59e0b',
      fecha_obtencion: '28 Ago 2026',
      entrenador_nombre: 'Prof. Faustino Asprilla',
      cancha_nombre: 'Cancha Sintética Pie de la Popa',
      nivel: '🥇 Nivel Oro',
      desbloqueada: true,
      puntaje_evaluacion: 94,
      metrica_clave: '88% duelos 1v1 ganados',
      descripcion: 'Fintas de cuerpo, cambio de ritmo y cambio de dirección con regate en velocidad y salida por ambos perfiles.'
    },
    {
      id: 'ins-4',
      nombre: '🎯 Francotirador de Élite',
      clinica_titulo: 'Definición Quirúrgica & Efecto Messi',
      categoria: 'DEFINICIÓN & TIRO',
      icono: 'fa-bullseye',
      color_tema: '#8b5cf6',
      fecha_obtencion: '12 Ago 2026',
      entrenador_nombre: 'Prof. Víctor Danilo Pacheco',
      cancha_nombre: 'Cancha Bombonera Bocagrande',
      nivel: '👑 Nivel Diamante',
      desbloqueada: true,
      puntaje_evaluacion: 97,
      metrica_clave: '92% efectividad en remate colocado',
      descripcion: 'Golpeo con rosca interna, colocación en ángulos imposibles y serenidad bajo presión en el área chica.'
    },
    {
      id: 'ins-5',
      nombre: '🧤 Muralla Imbatible',
      clinica_titulo: 'Arqueros de Élite & Guante de Oro',
      categoria: 'ARQUEROS',
      icono: 'fa-mitten',
      color_tema: '#ec4899',
      entrenador_nombre: 'Prof. Óscar Córdoba',
      cancha_nombre: 'Estadio San Fernando Cancha Sintética',
      nivel: 'Por Conquistar 🔒',
      desbloqueada: false,
      descripcion: 'Bloqueos aéreos, achiques 1v1 y reflejos felinos con disparos a quemarropa y juego de pies moderno.'
    },
    {
      id: 'ins-6',
      nombre: '👁️ Radar 360° Visionario',
      clinica_titulo: 'Visión Periférica & Pases Filtrados De Bruyne',
      categoria: 'VISIÓN & PASE',
      icono: 'fa-eye',
      color_tema: '#06b6d4',
      entrenador_nombre: 'Prof. Macnelly Torres',
      cancha_nombre: 'Cancha Maracaná Crespo',
      nivel: 'Por Conquistar 🔒',
      desbloqueada: false,
      descripcion: 'Escaneo constante de espacios libres antes de recibir y pases filtrados de primera intención rompiendo líneas.'
    },
    {
      id: 'ins-7',
      nombre: '🛡️ Fortaleza Infranqueable',
      clinica_titulo: 'Blindaje Defensivo & Duelos Aéreos Van Dijk',
      categoria: 'DEFENSA',
      icono: 'fa-shield-halved',
      color_tema: '#10b981',
      entrenador_nombre: 'Prof. Mario Alberto Yepes',
      cancha_nombre: 'Cancha Sintética Pie de la Popa',
      nivel: 'Por Conquistar 🔒',
      desbloqueada: false,
      descripcion: 'Temporización defensiva, anticipación táctica y timming de cabeceo ganando el 100% de los duelos.'
    },
    {
      id: 'ins-8',
      nombre: '🚀 Despegue Vertical CR7',
      clinica_titulo: 'Salto Explosivo & Remate de Cabeza Suspendido',
      categoria: 'POTENCIA & SALTO',
      icono: 'fa-jet-fighter-up',
      color_tema: '#f59e0b',
      entrenador_nombre: 'Prof. Iván Ramiro Córdoba',
      cancha_nombre: 'Complejo Deportivo Los Calamares',
      nivel: 'Por Conquistar 🔒',
      desbloqueada: false,
      descripcion: 'Potencia de salto pliométrico con suspensión en el aire y técnica de cabeceo martillado hacia abajo.'
    }
  ]);

  // Computed signals
  insigniasDesbloqueadas = computed(() => {
    return this.insigniasList().filter(i => i.desbloqueada);
  });

  insigniasBloqueadas = computed(() => {
    return this.insigniasList().filter(i => !i.desbloqueada);
  });

  porcentajeMaestria = computed(() => {
    const total = this.insigniasList().length;
    if (total === 0) return 0;
    return Math.round((this.insigniasDesbloqueadas().length / total) * 100);
  });

  filteredInsignias = computed(() => {
    const filter = this.filtroInsignias();
    if (filter === 'DESBLOQUEADAS') {
      return this.insigniasDesbloqueadas();
    }
    if (filter === 'BLOQUEADAS') {
      return this.insigniasBloqueadas();
    }
    return this.insigniasList();
  });

  ngOnInit(): void {}

  abrirDetalleInsignia(insignia: InsigniaDeportista): void {
    this.selectedInsignia.set(insignia);
  }

  cerrarDetalleInsignia(): void {
    this.selectedInsignia.set(null);
  }

  compartirInsigniaWhatsApp(): void {
    const ins = this.selectedInsignia();
    if (!ins) return;

    const text = encodeURIComponent(
      `🏆 *¡Logro Desbloqueado en SportCoreOS!*\n` +
      `Insignia Oficial: *${ins.nombre}* (${ins.nivel})\n` +
      `Clínica: ${ins.clinica_titulo}\n` +
      `Evaluador: ${ins.entrenador_nombre}\n` +
      `Métrica: ${ins.metrica_clave}\n` +
      `Sede: ${ins.cancha_nombre} (Cartagena)\n` +
      `¡Orgullo de Atleta SportCoreOS!`
    );

    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  descargarCertificado(): void {
    const ins = this.selectedInsignia();
    if (!ins) return;
    this.alertService.success(`¡Diploma Oficial de "${ins.nombre}" generado y listo para guardar!`);
  }

  cambiarClave(): void {
    this.alertService.info('Se ha enviado un enlace de cambio de contraseña a tu correo registrado.');
  }

  toggleNotificaciones(): void {
    this.alertService.success('Preferencias de notificaciones actualizadas.');
  }

  logout(): void {
    this.authService.logout();
  }
}
