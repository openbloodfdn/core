import { Module } from '@nestjs/common';
import { GeocodeLocationController } from './geocode-location.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';

@Module({
  controllers: [GeocodeLocationController],
  providers: [NeonService],
  imports: [NeonModule],
})
export class GeocodeLocationModule {}
