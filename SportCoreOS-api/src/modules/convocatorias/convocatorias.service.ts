import { Injectable, NotFoundException } from '@nestjs/common';
import { ConvocatoriasRepository } from './convocatorias.repository';
import { RolConvocatoria, EstadoConfirmacionConvocatoria } from '../../common/enums/domain.enums';

@Injectable()
export class ConvocatoriasService {
  constructor(private readonly convocatoriasRepo: ConvocatoriasRepository) {}

  async findByPartido(partidoId: string) {
    const [jugadores, partido] = await Promise.all([
      this.convocatoriasRepo.findJugadoresConvocados(partidoId),
      this.convocatoriasRepo.findPartidoInfo(partidoId),
    ]);

    return {
      partido,
      convocatoria: { id: partidoId, partido_id: partidoId },
      jugadores,
    };
  }

  async responderConvocatoria(
    convocatoriaId: string,
    estado: EstadoConfirmacionConvocatoria | string,
    motivoExcusa?: string,
    jugadorId?: string,
  ) {
    return this.convocatoriasRepo.updateEstadoConfirmacion(
      convocatoriaId,
      estado,
      motivoExcusa,
      jugadorId,
    );
  }

  async addJugadorConvocatoria(
    partidoId: string,
    jugadorId: string,
    rol: RolConvocatoria | string = RolConvocatoria.TITULAR,
    posicion?: string,
  ) {
    const posDefault = await this.convocatoriasRepo.findJugadorPosicion(jugadorId);
    const pos = posicion || posDefault || 'Jugador de Campo';

    return this.convocatoriasRepo.upsertJugadorConvocatoria(partidoId, jugadorId, rol, pos);
  }

  async removeJugadorConvocatoria(partidoId: string, jugadorId: string) {
    return this.convocatoriasRepo.deleteJugadorConvocatoria(partidoId, jugadorId);
  }

  async cambiarRolConvocatoria(partidoId: string, jugadorId: string, nuevoRol: string) {
    return this.convocatoriasRepo.updateRolConvocatoria(partidoId, jugadorId, nuevoRol);
  }

  async sugerirConvocatoria(
    partidoId: string,
    limiteTitulares: number = 11,
    limiteSuplentes: number = 7,
  ) {
    const partido = await this.convocatoriasRepo.findPartidoInfo(partidoId);
    if (!partido) throw new NotFoundException('Partido no encontrado');

    const total = limiteTitulares + limiteSuplentes;
    const jugadoresDisponibles = await this.convocatoriasRepo.findJugadoresDisponiblesParaSugerencia(
      partido.club_id,
      partido.categoria_id,
      total,
    );

    for (let i = 0; i < jugadoresDisponibles.length; i++) {
      const jug = jugadoresDisponibles[i];
      const rol = i < limiteTitulares ? RolConvocatoria.TITULAR : RolConvocatoria.SUPLENTE;
      await this.convocatoriasRepo.insertSugerido(partidoId, jug.id, rol, jug.posicion_principal);
    }

    return this.findByPartido(partidoId);
  }
}
