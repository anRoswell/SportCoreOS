import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PassTicketData {
  title?: string;
  subtitle?: string;
  category?: string;
  athleteName?: string;
  athleteDorsal?: number | string;
  athletePhoto?: string;
  guardianName?: string;
  guardianPhone?: string;
  planName?: string;
  amountPaid?: number;
  paymentMethod?: string;
  paymentStatus?: 'APROBADO' | 'PENDIENTE_APROBACION' | 'RECHAZADO' | string;
  venueName?: string;
  venueAddress?: string;
  qrCodeToken?: string;
  referenceCode?: string;
  badgeName?: string;
  badgeColor?: string;
  themeColor?: string;
  validUntil?: string;
}

@Component({
  selector: 'app-digital-pass-ticket',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pass-ticket-card ticket-card" [class.pending-mode]="ticket.paymentStatus === 'PENDIENTE_APROBACION'">
      <!-- HEADER DEL PASE / TICKET -->
      <div class="ticket-header" [style.background]="getHeaderBackground()">
        <div class="ticket-brand">
          <div class="brand-shield"><i class="fa-solid fa-shield-halved"></i></div>
          <div class="brand-names">
            <span class="main-title">SPORTCORE OS</span>
            <span class="sub-title">PASE OFICIAL DE ACCESO</span>
          </div>
        </div>
        <div class="ticket-badge ticket-status" [class.badge-approved]="ticket.paymentStatus === 'APROBADO'" [class.badge-pending]="ticket.paymentStatus === 'PENDIENTE_APROBACION'">
          <i class="fa-solid" [ngClass]="ticket.paymentStatus === 'PENDIENTE_APROBACION' ? 'fa-clock' : 'fa-circle-check'"></i>
          {{ ticket.paymentStatus === 'PENDIENTE_APROBACION' ? 'PENDIENTE DE APROBACIÓN' : 'INSCRIPCIÓN CONFIRMADA' }}
        </div>
      </div>

      <!-- ALERTA INFORMATIVA SI ESTÁ EN REVISIÓN DE TESORERÍA -->
      <div class="pending-notice-bar pending-approval-banner" *ngIf="ticket.paymentStatus === 'PENDIENTE_APROBACION'">
        <i class="fa-solid fa-vault"></i>
        <div>
          <strong>Comprobante en Revisión de Tesorería</strong>
          <p>Tu cupo está apartado. El código QR quedará activo tan pronto se valide el depósito.</p>
        </div>
      </div>

      <!-- CUERPO PRINCIPAL -->
      <div class="ticket-body">
        <div class="ticket-headline">
          <h3>{{ ticket.title || 'Clínica Especializada SportCore' }}</h3>
          <span class="category-pill" *ngIf="ticket.category">{{ ticket.category }}</span>
        </div>

        <div class="ticket-details-grid">
          <div class="detail-item" *ngIf="ticket.athleteName">
            <span class="d-label">Atleta / Alumno:</span>
            <div class="athlete-val">
              <span class="dorsal-tag" *ngIf="ticket.athleteDorsal">#{{ ticket.athleteDorsal }}</span>
              <strong class="d-val">{{ ticket.athleteName }}</strong>
            </div>
          </div>

          <div class="detail-item" *ngIf="ticket.guardianName">
            <span class="d-label">Acudiente / Contacto:</span>
            <span class="d-val">{{ ticket.guardianName }} {{ ticket.guardianPhone ? '(' + ticket.guardianPhone + ')' : '' }}</span>
          </div>

          <div class="detail-item" *ngIf="ticket.planName">
            <span class="d-label">Plan / Modalidad:</span>
            <span class="d-val">{{ ticket.planName }}</span>
          </div>

          <div class="detail-item" *ngIf="ticket.amountPaid !== undefined">
            <span class="d-label">Total Liquidado:</span>
            <strong class="d-val text-emerald">&#36;{{ ticket.amountPaid | number }} COP</strong>
          </div>

          <div class="detail-item" *ngIf="ticket.venueName">
            <span class="d-label">Cancha / Sede:</span>
            <span class="d-val">{{ ticket.venueName }}</span>
          </div>

          <div class="detail-item" *ngIf="ticket.paymentMethod">
            <span class="d-label">Método de Pago:</span>
            <span class="d-val text-purple">{{ ticket.paymentMethod }}</span>
          </div>
        </div>

        <!-- RECOMPENSA DE INSIGNIA (SI APLICA) -->
        <div class="badge-reward-row" *ngIf="ticket.badgeName">
          <span class="badge-reward-lbl"><i class="fa-solid fa-award text-amber"></i> Desbloquea en Ficha 360°:</span>
          <span class="badge-reward-pill">{{ ticket.badgeName }}</span>
        </div>

        <!-- SECCIÓN DEL CÓDIGO QR -->
        <div class="qr-validation-section">
          <div class="qr-render-box">
            <img 
              [src]="'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + (ticket.qrCodeToken || 'SPORTCORE_PASS_DEMO')" 
              alt="Código QR de Acceso" />
          </div>
          <div class="qr-meta-info">
            <span class="token-code qr-code-text">{{ ticket.qrCodeToken || 'SPT-2026-PASS' }}</span>
            <span class="ref-code" *ngIf="ticket.referenceCode">Ref: {{ ticket.referenceCode }}</span>
            <p class="scan-instructions">
              Presenta este código en portería o al profesor en cancha para validar el ingreso.
            </p>
          </div>
        </div>
      </div>

      <!-- FOOTER DE ACCIONES -->
      <div class="ticket-footer">
        <button class="btn-share-whatsapp btn-whatsapp btn-whatsapp-share" (click)="onShareWhatsApp()">
          <i class="fa-brands fa-whatsapp"></i> Compartir Pase
        </button>
        <button class="btn-close-ticket btn-primary btn-close-sheet" (click)="onFinish()">
          <i class="fa-solid fa-check"></i> Finalizar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .pass-ticket-card {
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
      border: 1px solid #e2e8f0;
      max-width: 480px;
      margin: 0 auto;
      font-family: inherit;
    }

    .ticket-header {
      padding: 1.25rem;
      color: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .ticket-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .brand-shield {
      width: 38px;
      height: 38px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }

    .brand-names {
      display: flex;
      flex-direction: column;
    }

    .main-title {
      font-size: 1rem;
      font-weight: 900;
      letter-spacing: 0.05em;
    }

    .sub-title {
      font-size: 0.68rem;
      opacity: 0.9;
      font-weight: 600;
      letter-spacing: 0.04em;
    }

    .ticket-badge {
      font-size: 0.72rem;
      font-weight: 800;
      padding: 0.35rem 0.65rem;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .badge-approved { background: rgba(255, 255, 255, 0.25); color: #ffffff; }
    .badge-pending { background: #fef3c7; color: #b45309; }

    .pending-notice-bar {
      background: #fffbeb;
      border-bottom: 1px solid #fef3c7;
      padding: 0.75rem 1.25rem;
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      color: #92400e;
      font-size: 0.8rem;
    }

    .pending-notice-bar i {
      font-size: 1.1rem;
      color: #d97706;
      margin-top: 0.1rem;
    }

    .pending-notice-bar strong {
      display: block;
      color: #78350f;
    }

    .pending-notice-bar p {
      margin: 0.15rem 0 0;
      color: #92400e;
    }

    .ticket-body {
      padding: 1.25rem;
    }

    .ticket-headline {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px dashed #e2e8f0;
    }

    .ticket-headline h3 {
      font-size: 1.1rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    .category-pill {
      font-size: 0.7rem;
      font-weight: 700;
      background: #f1f5f9;
      color: #475569;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      white-space: nowrap;
    }

    .ticket-details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem 1rem;
      margin-bottom: 1rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .d-label {
      font-size: 0.7rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
    }

    .d-val {
      font-size: 0.88rem;
      color: #1e293b;
      font-weight: 600;
    }

    .athlete-val {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .dorsal-tag {
      background: #10b981;
      color: #ffffff;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
    }

    .text-emerald { color: #059669 !important; }
    .text-purple { color: #7c3aed !important; }

    .badge-reward-row {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.5rem 0.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      font-size: 0.8rem;
    }

    .badge-reward-pill {
      background: #fef3c7;
      color: #92400e;
      font-weight: 700;
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
    }

    .qr-validation-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #f8fafc;
      border: 2px dashed #cbd5e1;
      border-radius: 14px;
      padding: 1rem;
    }

    .qr-render-box {
      width: 100px;
      height: 100px;
      background: #ffffff;
      padding: 6px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .qr-render-box img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .qr-meta-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .token-code {
      font-family: monospace;
      font-size: 0.88rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.05em;
    }

    .ref-code {
      font-size: 0.75rem;
      color: #64748b;
    }

    .scan-instructions {
      font-size: 0.75rem;
      color: #64748b;
      margin: 0.3rem 0 0;
      line-height: 1.3;
    }

    .ticket-footer {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 0.75rem;
      padding: 1rem 1.25rem 1.25rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }

    .btn-share-whatsapp {
      background: #25d366;
      color: #ffffff;
      border: none;
      padding: 0.65rem 1rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition: background 0.2s;
    }
    .btn-share-whatsapp:hover { background: #1eb954; }

    .btn-close-ticket {
      background: #0f172a;
      color: #ffffff;
      border: none;
      padding: 0.65rem 1rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition: background 0.2s;
    }
    .btn-close-ticket:hover { background: #1e293b; }
  `]
})
export class DigitalPassTicketComponent {
  @Input({ required: true }) ticket!: PassTicketData;
  @Output() finish = new EventEmitter<void>();
  @Output() shareWhatsApp = new EventEmitter<void>();

  getHeaderBackground(): string {
    if (this.ticket.paymentStatus === 'PENDIENTE_APROBACION') {
      return 'linear-gradient(135deg, #d97706 0%, #b45309 100%)';
    }
    return this.ticket.themeColor || 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
  }

  onFinish() {
    this.finish.emit();
  }

  onShareWhatsApp() {
    this.shareWhatsApp.emit();
  }
}
