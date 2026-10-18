import { Component, Input, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { ApiService } from '../../../../core/services/api.service';
import {
  Role,
  ImportFilterMode,
  TipoDocumentoIdentidad,
  PosicionJugador,
  PiernaHabil,
} from '../../../../core/enums/domain.enums';

export interface PreviewResumen {
  totalFilas: number;
  filasValidasCount: number;
  filasConErrorCount: number;
  nuevasCategorias: string[];
  estimadoUsuariosJugador: number;
  estimadoUsuariosAcudiente: number;
  detalle: any[];
}

export interface CredencialGenerada {
  tipo: Role;
  nombreCompleto: string;
  documento: string;
  email: string;
  passwordPlano: string;
  categoria?: string;
}

@Component({
  selector: 'app-jugador-import-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jugador-import-modal.component.html',
  styleUrl: './jugador-import-modal.component.scss'
})
export class JugadorImportModalComponent {
  private api = inject(ApiService);

  @Input() visible = false;
  @Output() close = new EventEmitter<void>();
  @Output() importCompleted = new EventEmitter<void>();

  // Estados del flujo (1: Subida, 2: Preview & Validación, 3: Éxito y Credenciales)
  currentStep = signal<1 | 2 | 3>(1);

  // Archivo seleccionado
  selectedFile = signal<File | null>(null);
  isDragging = signal<boolean>(false);
  parsingFile = signal<boolean>(false);
  downloadingTemplate = signal<boolean>(false);

  // Filas en memoria leídas de Excel
  rawRows = signal<any[]>([]);

  // Preview del backend
  previewData = signal<PreviewResumen | null>(null);
  loadingPreview = signal<boolean>(false);
  errorMessage = signal<string>('');

  readonly ImportFilterMode = ImportFilterMode;
  readonly Role = Role;

  // Filtro de tabla preview
  filterMode = signal<ImportFilterMode>(ImportFilterMode.TODAS);

  // Ejecución
  executing = signal<boolean>(false);
  importResult = signal<any | null>(null);
  credenciales = signal<CredencialGenerada[]>([]);
  copiedIndex = signal<number | null>(null);
  copiedAll = signal<boolean>(false);

  // Filas filtradas en la tabla preview
  filteredPreviewRows = computed(() => {
    const data = this.previewData();
    if (!data || !data.detalle) return [];
    const mode = this.filterMode();
    if (mode === ImportFilterMode.VALIDAS) {
      return data.detalle.filter(r => r.esValida && (!r.advertencias || r.advertencias.length === 0));
    }
    if (mode === ImportFilterMode.ADVERTENCIAS) {
      return data.detalle.filter(r => r.advertencias && r.advertencias.length > 0);
    }
    if (mode === ImportFilterMode.ERRORES) {
      return data.detalle.filter(r => !r.esValida || (r.errores && r.errores.length > 0));
    }
    return data.detalle;
  });

  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging.set(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      this.handleFile(e.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: any) {
    const files = event.target?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  descargarPlantilla() {
    this.downloadingTemplate.set(true);
    this.api.descargarPlantillaExcelJugadores().subscribe({
      next: (blob) => {
        this.downloadingTemplate.set(false);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Plantilla_Importacion_Jugadores_SportCoreOS_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.downloadingTemplate.set(false);
        this.errorMessage.set('Error al descargar la plantilla oficial. Por favor intente nuevamente.');
      }
    });
  }

  private handleFile(file: File) {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      this.errorMessage.set('Formato no compatible. Por favor suba un archivo .xlsx, .xls o .csv');
      return;
    }
    this.selectedFile.set(file);
    this.errorMessage.set('');
    this.parseExcelFile(file);
  }

  private parseExcelFile(file: File) {
    this.parsingFile.set(true);
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
        let sheetName = workbook.SheetNames.find(n => n.toLowerCase().includes('plantilla') || n.toLowerCase().includes('jugadores')) || workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          this.errorMessage.set('El archivo Excel está vacío o no contiene filas con datos.');
          this.parsingFile.set(false);
          return;
        }

        const normalizedRows = rawJson.map((row) => {
          const cleanRow: any = {};
          Object.keys(row).forEach((key) => {
            const cleanKey = key
              .trim()
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9_]/g, '_');

            let val = row[key];
            if (val instanceof Date) {
              val = val.toISOString().slice(0, 10);
            }
            cleanRow[cleanKey] = val;
          });

          let fecha = cleanRow.fechanacimiento || cleanRow.fechanacimientojugador || cleanRow.fecha_nacimiento_jugador || cleanRow.fecha_de_nacimiento_aaaa_mm_dd || cleanRow.fecha_de_nacimiento || cleanRow.fecha_nacimiento || cleanRow.nacimiento || '';
          if (typeof fecha === 'number') {
            const parsedDate = new Date(Math.round((fecha - 25569) * 86400 * 1000));
            if (!isNaN(parsedDate.getTime())) {
              fecha = parsedDate.toISOString().slice(0, 10);
            }
          }

          return {
            nombres: cleanRow.nombresjugador || cleanRow.nombres_jugador || cleanRow.nombres_del_jugador || cleanRow.nombres || cleanRow.nombre || '',
            apellidos: cleanRow.apellidosjugador || cleanRow.apellidos_jugador || cleanRow.apellidos_del_jugador || cleanRow.apellidos || cleanRow.apellido || '',
            tipo_documento: cleanRow.tipodocumento || cleanRow.tipodocumentojugador || cleanRow.tipo_documento_jugador || cleanRow.tipo_documento_ti_cc_ce_pas || cleanRow.tipo_documento || cleanRow.tipo_doc || TipoDocumentoIdentidad.TI,
            numero_documento: cleanRow.numerodocumento || cleanRow.numerodocumentojugador || cleanRow.numero_documento_jugador || cleanRow.numero_de_documento_sin_puntos || cleanRow.numero_de_documento || cleanRow.numero_documento || cleanRow.documento || '',
            fecha_nacimiento: fecha,
            codigo_categoria: cleanRow.codigocategoria || cleanRow.codigo_categoria || cleanRow.codcat || cleanRow.cod_cat || null,
            categoria: cleanRow.nombrecategoria || cleanRow.nombre_categoria || cleanRow.categoria || cleanRow.categoria_ej_sub_13_2026 || cleanRow.codigocategoria || cleanRow.codigo_categoria || 'Sin Asignar',
            posicion_principal: cleanRow.posicionprincipal || cleanRow.posicion_principal || cleanRow.posicion || PosicionJugador.DELANTERO,
            pierna_habil: cleanRow.piernahabil || cleanRow.pierna_habil || cleanRow.pierna_habil_diestro_zurdo_ambidiestro || cleanRow.pierna || PiernaHabil.DIESTRO,
            numero_dorsal: cleanRow.numerodorsal !== undefined && cleanRow.numerodorsal !== null && cleanRow.numerodorsal !== '' 
              ? Number(cleanRow.numerodorsal) 
              : (cleanRow.numero_dorsal_opcional || cleanRow.numero_dorsal || cleanRow.dorsal || null),
            nombres_acudiente: cleanRow.nombresacudiente || cleanRow.nombres_acudiente || cleanRow.nombres_del_padre_acudiente || cleanRow.nombre_acudiente || '',
            apellidos_acudiente: cleanRow.apellidosacudiente || cleanRow.apellidos_acudiente || cleanRow.apellidos_del_padre_acudiente || cleanRow.apellido_acudiente || '',
            documento_acudiente: cleanRow.numerodocumentoacudiente || cleanRow.numero_documento_acudiente || cleanRow.documento_acudiente || '',
            email_acudiente: cleanRow.emailacudiente || cleanRow.email_acudiente || cleanRow.email_del_acudiente_para_crear_usuario || cleanRow.correo_acudiente || '',
          };
        });

        this.rawRows.set(normalizedRows);
        this.parsingFile.set(false);
        this.solicitarPreview(normalizedRows);
      } catch (err: any) {
        this.parsingFile.set(false);
        this.errorMessage.set(`Error al procesar el archivo Excel: ${err?.message || 'Formato inválido'}`);
      }
    };

    reader.onerror = () => {
      this.parsingFile.set(false);
      this.errorMessage.set('No se pudo leer el archivo seleccionado.');
    };

    reader.readAsArrayBuffer(file);
  }

  private solicitarPreview(filas: any[]) {
    this.loadingPreview.set(true);
    this.errorMessage.set('');

    this.api.previewImportacionMasivaJugadores(filas).subscribe({
      next: (res) => {
        this.loadingPreview.set(false);
        this.previewData.set(res);
        this.currentStep.set(2);
      },
      error: (err) => {
        this.loadingPreview.set(false);
        this.errorMessage.set(err?.error?.message || 'Error al validar los datos con el servidor.');
      }
    });
  }

  volverPaso1() {
    this.currentStep.set(1);
    this.selectedFile.set(null);
    this.rawRows.set([]);
    this.previewData.set(null);
    this.errorMessage.set('');
  }

  ejecutarImportacion() {
    const raw = this.rawRows();
    if (!raw || raw.length === 0) return;

    this.executing.set(true);
    this.errorMessage.set('');

    this.api.ejecutarImportacionMasivaJugadores(raw).subscribe({
      next: (res) => {
        this.executing.set(false);
        this.importResult.set(res);
        this.credenciales.set(res.credencialesGeneradas || []);
        this.currentStep.set(3);
        this.importCompleted.emit();
      },
      error: (err) => {
        this.executing.set(false);
        this.errorMessage.set(err?.error?.message || 'Error durante la ejecución de la importación masiva.');
      }
    });
  }

  copiarCredencial(c: CredencialGenerada, index: number) {
    const text = `Acceso SportCoreOS\nRol: ${c.tipo}\nUsuario: ${c.email}\nContraseña Temporal: ${c.passwordPlano}\nPortal: https://app.sportcore.com`;
    navigator.clipboard.writeText(text);
    this.copiedIndex.set(index);
    setTimeout(() => this.copiedIndex.set(null), 2500);
  }

  copiarTodasCredenciales() {
    const list = this.credenciales();
    if (!list || list.length === 0) return;

    const lines = list.map((c, i) => 
      `${i + 1}. [${c.tipo}] ${c.nombreCompleto} (Doc: ${c.documento})\n   Email: ${c.email}\n   Clave: ${c.passwordPlano}`
    ).join('\n\n');

    const header = `=== CREDENCIALES DE ACCESO GENERADAS - SPORTCOREOS ===\nFecha: ${new Date().toLocaleString()}\nTotal Cuentas: ${list.length}\n\n`;
    navigator.clipboard.writeText(header + lines);
    this.copiedAll.set(true);
    setTimeout(() => this.copiedAll.set(false), 3000);
  }

  exportarCredencialesExcel() {
    const list = this.credenciales();
    if (!list || list.length === 0) return;

    const data = list.map(c => ({
      'TIPO DE CUENTA': c.tipo === Role.PADRE_ACUDIENTE ? 'Padre / Acudiente Familiar' : 'Jugador Atleta (≥14 años)',
      'NOMBRE COMPLETO': c.nombreCompleto,
      'DOCUMENTO': c.documento,
      'CATEGORÍA': c.categoria || 'N/A',
      'CORREO / USUARIO': c.email,
      'CONTRASEÑA TEMPORAL': c.passwordPlano,
      'ESTADO': 'ACTIVO - PENDIENTE PRIMER INGRESO',
      'INSTRUCCIÓN': 'Al ingresar por primera vez se le solicitará cambiar su contraseña.'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Credenciales');
    XLSX.writeFile(wb, `Credenciales_SportCoreOS_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  onClose() {
    this.close.emit();
    setTimeout(() => {
      this.currentStep.set(1);
      this.selectedFile.set(null);
      this.previewData.set(null);
      this.rawRows.set([]);
      this.credenciales.set([]);
      this.errorMessage.set('');
    }, 300);
  }
}
