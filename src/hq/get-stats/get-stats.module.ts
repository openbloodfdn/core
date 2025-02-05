import { Module } from '@nestjs/common';
import { GetStatsController } from './get-stats.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';
import { HqAuthService } from 'src/services/hq-auth/hq-auth.service';

@Module({
  controllers: [GetStatsController],
  providers: [NeonService, HqAuthService],
  imports: [NeonModule],
})
export class GetStatsModule {}
