import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ParametrosRepository, ParametroRow } from './parametros.repository';
import { CreateParametroDto, UpdateParametroDto, TipoValorParametro } from './parametros.dto';

@Injectable()
export class ParametrosService {
  private readonly logger = new Logger(ParametrosService.name);
  private cache = new Map<string, string>();

  constructor(private readonly repo: ParametrosRepository) {}

  async getAll(clubId?: string | null) {
    const list = await this.repo.findAll(clubId);
    return list;
  }

  async getByModulo(modulo: string, clubId?: string | null) {
    return this.repo.findByModulo(modulo, clubId);
  }

  async getByClave(clave: string, clubId?: string | null) {
    const param = await this.repo.findByClave(clave, clubId);
    if (!param) {
      throw new NotFoundException(`Parámetro con clave '${clave}' no encontrado.`);
    }
    return param;
  }

  async create(dto: CreateParametroDto) {
    this.validateValueType(dto.valor, dto.tipoValor || TipoValorParametro.STRING);
    const existing = await this.repo.findByClave(dto.clave, dto.clubId);
    if (existing && existing.club_id === (dto.clubId || null)) {
      throw new BadRequestException(`Ya existe un parámetro con la clave '${dto.clave}' para este ámbito.`);
    }
    const created = await this.repo.create(dto);
    this.cache.set(`${created.club_id || 'global'}:${created.clave}`, created.valor);
    return created;
  }

  async update(id: string, dto: UpdateParametroDto) {
    const current = await this.repo.findById(id);
    if (!current) {
      throw new NotFoundException(`Parámetro con ID ${id} no encontrado.`);
    }

    if (!current.es_editable) {
      throw new BadRequestException(`El parámetro '${current.clave}' es de solo lectura y no puede modificarse.`);
    }

    this.validateValueType(dto.valor, current.tipo_valor as TipoValorParametro);

    const updated = await this.repo.update(id, dto);
    if (updated) {
      this.cache.set(`${updated.club_id || 'global'}:${updated.clave}`, updated.valor);
    }
    return updated;
  }

  async delete(id: string) {
    const current = await this.repo.findById(id);
    if (!current) {
      throw new NotFoundException(`Parámetro con ID ${id} no encontrado.`);
    }
    if (!current.es_editable) {
      throw new BadRequestException('No se puede eliminar un parámetro reservado del sistema.');
    }
    const ok = await this.repo.delete(id);
    this.cache.delete(`${current.club_id || 'global'}:${current.clave}`);
    return { success: ok, message: `Parámetro '${current.clave}' eliminado correctamente.` };
  }

  private validateValueType(value: string, type: TipoValorParametro) {
    switch (type) {
      case TipoValorParametro.NUMBER:
        if (isNaN(Number(value))) {
          throw new BadRequestException(`El valor '${value}' debe ser un número válido.`);
        }
        break;
      case TipoValorParametro.BOOLEAN:
        if (value !== 'true' && value !== 'false') {
          throw new BadRequestException(`El valor '${value}' debe ser 'true' o 'false'.`);
        }
        break;
      case TipoValorParametro.JSON:
        try {
          JSON.parse(value);
        } catch {
          throw new BadRequestException(`El valor '${value}' no es una estructura JSON válida.`);
        }
        break;
      case TipoValorParametro.STRING:
      default:
        break;
    }
  }

  // Fast Typed Helpers for Application Business Logic
  async getString(clave: string, defaultValue = '', clubId?: string): Promise<string> {
    const key = `${clubId || 'global'}:${clave}`;
    if (this.cache.has(key)) return this.cache.get(key)!;
    const p = await this.repo.findByClave(clave, clubId);
    if (p && p.estado) {
      this.cache.set(key, p.valor);
      return p.valor;
    }
    return defaultValue;
  }

  async getNumber(clave: string, defaultValue = 0, clubId?: string): Promise<number> {
    const val = await this.getString(clave, String(defaultValue), clubId);
    const num = Number(val);
    return isNaN(num) ? defaultValue : num;
  }

  async getBoolean(clave: string, defaultValue = false, clubId?: string): Promise<boolean> {
    const val = await this.getString(clave, String(defaultValue), clubId);
    return val.toLowerCase() === 'true';
  }
}
