import { Module } from '@nestjs/common';
import { UserStatsController } from './user-stats.controller';
import { DBService } from 'src/services/db/db.service';
import { TimestampService } from 'src/services/timestamp/timestamp.service';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';

@Module({
  controllers: [UserStatsController],
  providers: [DBService, TimestampService, NeonService],
  imports: [NeonModule],
})
export class UserStatsModule {}
