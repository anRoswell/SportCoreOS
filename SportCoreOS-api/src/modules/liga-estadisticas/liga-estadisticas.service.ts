import { BadRequestException, Injectable } from '@nestjs/common';
import { LigaEstadisticasRepository } from './liga-estadisticas.repository';
import { ImportarPartidoLigaCsvDto, RegistrarPartidoLigaDto } from './liga-estadisticas.dto';

@Injectable()
export class LigaEstadisticasService {
  constructor(private readonly repository: LigaEstadisticasRepository) {}

  listar(clubId: string, categoriaId?: string, temporada?: string) {
    return this.repository.list(clubId, { categoriaId, temporada });
  }

  async registrarManual(clubId: string, actorId: string, dto: RegistrarPartidoLigaDto) {
    const players = this.normalizePlayers(dto.jugadores);
    return this.repository.createPending(clubId, actorId, dto, players, 'MANUAL');
  }

  async importarCsv(clubId: string, actorId: string, dto: ImportarPartidoLigaCsvDto) {
    if (dto.csvContenido.length > 1_000_000) {
      throw new BadRequestException('El CSV supera el tamaño máximo de 1 MB.');
    }
    const dorsalMap = await this.repository.resolveDorsals(clubId, dto.categoriaId);
    const parsed = this.repository.parseCsv(dto.csvContenido, dorsalMap);
    const players = this.normalizePlayers(parsed);
    const match: RegistrarPartidoLigaDto = {
      categoriaId: dto.categoriaId,
      competenciaNombre: dto.competenciaNombre,
      temporada: dto.temporada,
      fechaPartido: dto.fechaPartido,
      rivalNombre: dto.rivalNombre,
      golesClub: dto.golesClub,
      golesRival: dto.golesRival,
      jugadores: players,
    };
    return this.repository.createPending(clubId, actorId, match, players, 'CSV');
  }

  validar(clubId: string, actorId: string, partidoId: string) {
    return this.repository.validate(clubId, actorId, partidoId);
  }

  private normalizePlayers(players: any[]) {
    if (!Array.isArray(players) || players.length < 1) {
      throw new BadRequestException('Registra estadísticas de al menos un jugador.');
    }
    const seen = new Set<string>();
    return players.map((player) => {
      if (!player.jugadorId) throw new BadRequestException('Cada estadística debe estar vinculada a un jugador.');
      if (seen.has(player.jugadorId)) throw new BadRequestException('No repitas jugadores en una misma acta.');
      seen.add(player.jugadorId);
      const normalized = {
        jugadorId: player.jugadorId,
        dorsal: player.dorsal,
        minutos: Number(player.minutos ?? 0),
        goles: Number(player.goles ?? 0),
        asistencias: Number(player.asistencias ?? 0),
        remates: Number(player.remates ?? 0),
        rematesAPuerta: Number(player.rematesAPuerta ?? 0),
        pasesClave: Number(player.pasesClave ?? 0),
        regatesExitosos: Number(player.regatesExitosos ?? 0),
        recuperaciones: Number(player.recuperaciones ?? 0),
        intercepciones: Number(player.intercepciones ?? 0),
        duelosGanados: Number(player.duelosGanados ?? 0),
        atajadas: Number(player.atajadas ?? 0),
      };
      const numbers = Object.entries(normalized)
        .filter(([key]) => key !== 'jugadorId' && key !== 'dorsal')
        .map(([, value]) => Number(value));
      if (numbers.some((value) => !Number.isInteger(value) || value < 0)) {
        throw new BadRequestException('Las estadísticas deben ser números enteros iguales o mayores que cero.');
      }
      if (normalized.minutos > 120 || normalized.rematesAPuerta > normalized.remates) {
        throw new BadRequestException('Revisa los minutos y los remates a puerta del jugador.');
      }
      return normalized;
    });
  }
}
