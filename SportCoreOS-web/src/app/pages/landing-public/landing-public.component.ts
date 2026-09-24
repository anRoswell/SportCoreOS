import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService, LandingPage, LandingLead } from '../../core/services/api.service';

@Component({
  selector: 'app-landing-public',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing-public.component.html',
  styleUrl: './landing-public.component.scss',
})
export class LandingPublicComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  landing = signal<LandingPage | null>(null);
  loading = signal<boolean>(true);
  notFound = signal<boolean>(false);

  // Form model for lead capture
  leadForm: Partial<LandingLead> = {
    nombre_completo: '',
    email: '',
    telefono: '',
    nombre_deportista: '',
    edad_deportista: undefined,
    categoria_interes: '',
    mensaje: '',
  };

  submittingLead = signal<boolean>(false);
  leadSubmitted = signal<boolean>(false);
  leadSuccessMessage = signal<string>('');
  formErrorMessage = signal<string>('');

  // Active accordion index for FAQs
  activeFaqIndex = signal<number | null>(0);

  // Stories active index
  activeStoryIndex = signal<number>(0);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const slug = params['slug'];
      if (slug) {
        this.loadLanding(slug);
      } else {
        this.notFound.set(true);
        this.loading.set(false);
      }
    });
  }

  loadLanding(slug: string): void {
    this.loading.set(true);
    this.notFound.set(false);

    this.api.getPublicLanding(slug).subscribe({
      next: (data) => {
        if (data && data.titulo) {
          this.landing.set(data);
          // Set page meta title
          document.title = `${data.titulo} • SportCore`;
        } else {
          this.notFound.set(true);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar landing pública:', err);
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  submitLeadForm(): void {
    const l = this.landing();
    if (!l) return;

    if (!this.leadForm.nombre_completo?.trim()) {
      this.formErrorMessage.set('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!this.leadForm.email?.trim() || !this.leadForm.email.includes('@')) {
      this.formErrorMessage.set('Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (!this.leadForm.telefono?.trim() || this.leadForm.telefono.length < 7) {
      this.formErrorMessage.set('Por favor ingresa un número de teléfono o WhatsApp válido.');
      return;
    }

    this.formErrorMessage.set('');
    this.submittingLead.set(true);

    this.api.submitLead(l.slug, this.leadForm).subscribe({
      next: (res) => {
        this.submittingLead.set(false);
        this.leadSubmitted.set(true);
        this.leadSuccessMessage.set(res.message || '¡Tu solicitud fue enviada con éxito!');
      },
      error: (err) => {
        this.submittingLead.set(false);
        this.formErrorMessage.set(
          err.error?.message || 'Hubo un error al enviar el formulario. Intenta nuevamente.'
        );
      },
    });
  }

  scrollToSection(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  toggleFaq(index: number): void {
    if (this.activeFaqIndex() === index) {
      this.activeFaqIndex.set(null);
    } else {
      this.activeFaqIndex.set(index);
    }
  }

  openWhatsApp(): void {
    const l = this.landing();
    const phone = (l?.boton_contacto_whatsapp || '+573001234567').replace(/\D/g, '');
    const title = l?.titulo || 'la academia';
    const text = encodeURIComponent(
      `¡Hola! 👋 Vengo desde la página web de "${title}" y deseo más información para la pre-inscripción.`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  }

  resetForm(): void {
    this.leadSubmitted.set(false);
    this.leadForm = {
      nombre_completo: '',
      email: '',
      telefono: '',
      nombre_deportista: '',
      edad_deportista: undefined,
      categoria_interes: '',
      mensaje: '',
    };
  }
}
