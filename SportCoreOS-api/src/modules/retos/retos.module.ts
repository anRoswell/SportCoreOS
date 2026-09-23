import { Module } from '@nestjs/common';
import { RetosController } from './retos.controller';
import { RetosService } from './retos.service';
import { RetosRepository } from './retos.repository';

@Module({
  controllers: [RetosController],
  providers: [RetosService, RetosRepository],
  exports: [RetosService, RetosRepository],
})
export class RetosModule {}
