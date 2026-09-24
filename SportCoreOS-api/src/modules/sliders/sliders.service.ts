import { Injectable, NotFoundException } from '@nestjs/common';
import { SlidersRepository, SliderPromocionalEntity } from './sliders.repository';
import { CreateSliderDto, UpdateSliderDto } from './sliders.dto';

@Injectable()
export class SlidersService {
  constructor(private readonly repository: SlidersRepository) {}

  async getSliders(clubId?: string, plataforma?: string, soloActivos = false): Promise<SliderPromocionalEntity[]> {
    return this.repository.findAll(clubId, plataforma, soloActivos);
  }

  async getActiveSliders(plataforma = 'TODAS', clubId?: string): Promise<SliderPromocionalEntity[]> {
    return this.repository.findAll(clubId, plataforma, true);
  }

  async getSliderById(id: string): Promise<SliderPromocionalEntity> {
    const slider = await this.repository.findById(id);
    if (!slider) {
      throw new NotFoundException(`Slider promocional con ID '${id}' no encontrado.`);
    }
    return slider;
  }

  async createSlider(clubId: string | null, dto: CreateSliderDto): Promise<SliderPromocionalEntity> {
    return this.repository.create(clubId, dto);
  }

  async updateSlider(id: string, dto: UpdateSliderDto): Promise<SliderPromocionalEntity> {
    const updated = await this.repository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Slider promocional con ID '${id}' no encontrado.`);
    }
    return updated;
  }

  async toggleActivo(id: string): Promise<SliderPromocionalEntity> {
    const toggled = await this.repository.toggleActivo(id);
    if (!toggled) {
      throw new NotFoundException(`Slider promocional con ID '${id}' no encontrado.`);
    }
    return toggled;
  }

  async reorderSliders(ids: string[]): Promise<{ success: boolean; message: string }> {
    await this.repository.reorder(ids);
    return { success: true, message: 'Orden de sliders actualizado exitosamente.' };
  }

  async deleteSlider(id: string): Promise<{ success: boolean; message: string }> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Slider promocional con ID '${id}' no encontrado.`);
    }
    return { success: true, message: 'Slider promocional eliminado correctamente.' };
  }
}
