import { Module } from '@nestjs/common';
import { CulturesService } from './services/cultures.service';
import { CulturesController } from './controllers/cultures.controller';

@Module({
  providers: [CulturesService],
  controllers: [CulturesController]
})
export class CulturesModule {}
