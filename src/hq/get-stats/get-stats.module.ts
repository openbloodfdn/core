import { Module } from '@nestjs/common';
import { GetStatsController } from './get-stats.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';

@Module({
  controllers: [GetStatsController],
  providers: [NeonService],
  imports: [NeonModule],
})
export class GetStatsModule {}
