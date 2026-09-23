import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';

export interface NoticiaClub {
  id: string;
  titulo: string;
  categoria: 'comunicado' | 'torneo' | 'viaje' | 'sede';
  fecha: string;
  imagen: string;
  resumen: string;
  contenido: string;
  requiereFirma?: boolean;
  firmado?: boolean;
}

@Component({
  selector: 'app-noticias-mobile',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrollingModule, MobileHeaderComponent, BottomNavComponent],
  templateUrl: './noticias-mobile.component.html',
  styleUrl: './noticias-mobile.component.scss'
})
export class NoticiasMobileComponent implements OnInit {
  auth = inject(AuthService);
  noticiaSeleccionada = signal<NoticiaClub | null>(null);
  isRefreshing = signal<boolean>(false);
  isLoadingMore = signal<boolean>(false);
  hasReachedEnd = signal<boolean>(false);

  // Buffer de datos para Infinite Scroll
  private allNoticias: NoticiaClub[] = [];
  displayedNoticias = signal<NoticiaClub[]>([]);
  totalDisponibles = 0;
  private pageSize = 5;
  private currentOffset = 0;

  ngOnInit(): void {
    this.generarCatalogoNoticias();
    this.cargarMasNoticias();
  }

  trackById(index: number, item: NoticiaClub): string {
    return item.id;
  }

  private generarCatalogoNoticias(): void {
    const baseList: NoticiaClub[] = [
      {
        id: 'news-1',
        titulo: 'Convocatoria y Viaje Oficial a Torneo Nacional Medellín 2026',
        categoria: 'viaje',
        fecha: '22 de Septiembre, 2026',
        imagen: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=600&auto=format&fit=crop&q=80',
        resumen: 'Se abre el proceso de inscripción y autorización para las categorías Sub-13, Sub-15 y Sub-17 para el torneo en Medellín.',
        contenido: 'El club participará en la Copa Nacional Élite de Fútbol Formativo. El desplazamiento se realizará el 15 de Octubre con póliza médica todo riesgo y cuerpo técnico completo. Todos los acudientes deben firmar la autorización digital antes del 30 de Septiembre.',
        requiereFirma: true,
        firmado: false
      },
      {
        id: 'news-2',
        titulo: 'Inauguración de Nuevas Luminarias LED en Campo Sintético',
        categoria: 'sede',
        fecha: '18 de Septiembre, 2026',
        imagen: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&auto=format&fit=crop&q=80',
        resumen: 'A partir de este lunes contaremos con iluminación profesional en todas las canchas para entrenamientos nocturnos seguros.',
        contenido: 'La directiva del club culminó la instalación de las nuevas torres de iluminación de 500 Lux, permitiendo extender los horarios de entrenamiento y partidos nocturnos en condiciones óptimas de visibilidad.',
        requiereFirma: false
      },
      {
        id: 'news-3',
        titulo: 'Visoría Oficial Club Atlético Nacional & Detección de Talentos',
        categoria: 'torneo',
        fecha: '15 de Septiembre, 2026',
        imagen: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80',
        resumen: 'Veedores de primera división evaluarán a nuestros deportistas destacados de las categorías Sub-15 y Sub-17.',
        contenido: 'Jornada especial de evaluación técnica y física con presencia del departamento de scouting profesional. Los jugadores deben presentarse con indumentaria oficial completa.',
        requiereFirma: true,
        firmado: true
      },
      {
        id: 'news-4',
        titulo: 'Taller de Nutrición e Hidratación Deportiva para Acudientes',
        categoria: 'comunicado',
        fecha: '12 de Septiembre, 2026',
        imagen: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80',
        resumen: 'Aprende a estructurar la alimentación pre y post-competitiva para potenciar el rendimiento y recuperación.',
        contenido: 'Capacitación virtual y presencial dictada por la nutricionista deportiva del club. Se entregarán guías descargables con menús semanales de alta energía.',
        requiereFirma: false
      },
      {
        id: 'news-5',
        titulo: 'Entrega de Nuevos Kits de Entrenamiento Oficial 2026',
        categoria: 'sede',
        fecha: '08 de Septiembre, 2026',
        imagen: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&auto=format&fit=crop&q=80',
        resumen: 'Los kits de indumentaria deportiva ya se encuentran disponibles para reclamo en la sede administrativa.',
        contenido: 'Cada deportista recibirá camiseta de presentación, pantaloneta y medias. Verificar tallaje previamente con el coordinador de tienda.',
        requiereFirma: false
      }
    ];

    // Multiplicar elementos para simular histórico de 30 noticias con virtual scroll
    this.allNoticias = [];
    for (let i = 0; i < 6; i++) {
      baseList.forEach(item => {
        this.allNoticias.push({
          ...item,
          id: `${item.id}-${i}`,
          titulo: i === 0 ? item.titulo : `${item.titulo} (Edición ${2026 - i})`,
          fecha: `${Math.max(1, 22 - (i * 3))} de Agosto, 2026`
        });
      });
    }
    this.totalDisponibles = this.allNoticias.length;
  }

  cargarMasNoticias(): void {
    if (this.isLoadingMore() || this.hasReachedEnd()) return;

    this.isLoadingMore.set(true);
    setTimeout(() => {
      const nextBatch = this.allNoticias.slice(this.currentOffset, this.currentOffset + this.pageSize);
      if (nextBatch.length > 0) {
        this.displayedNoticias.update(current => [...current, ...nextBatch]);
        this.currentOffset += this.pageSize;
      }
      if (this.currentOffset >= this.allNoticias.length) {
        this.hasReachedEnd.set(true);
      }
      this.isLoadingMore.set(false);
    }, 400);
  }

  onScrollChange(index: number): void {
    const totalLoaded = this.displayedNoticias().length;
    // Si el usuario hace scroll cerca del final (a 2 elementos del límite cargado)
    if (index >= totalLoaded - 2 && !this.isLoadingMore() && !this.hasReachedEnd()) {
      this.cargarMasNoticias();
    }
  }

  recargarNoticias(): void {
    this.isRefreshing.set(true);
    this.currentOffset = 0;
    this.displayedNoticias.set([]);
    this.hasReachedEnd.set(false);

    setTimeout(() => {
      this.cargarMasNoticias();
      this.isRefreshing.set(false);
    }, 500);
  }

  verDetalle(noticia: NoticiaClub) {
    this.noticiaSeleccionada.set(noticia);
  }

  firmarDocumento() {
    const act = this.noticiaSeleccionada();
    if (!act) return;

    const list = this.displayedNoticias().map(n => n.id === act.id ? { ...n, firmado: true } : n);
    this.displayedNoticias.set(list);
    this.noticiaSeleccionada.set({ ...act, firmado: true });
    alert('¡Autorización y consentimiento firmado digitalmente con éxito!');
  }
}
