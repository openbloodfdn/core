import { Module } from '@nestjs/common';
import { GetBanksController } from './get-banks.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';
import { TimestampService } from 'src/services/timestamp/timestamp.service';

@Module({
  controllers: [GetBanksController],
  providers: [NeonService, TimestampService],
  imports: [NeonModule]
})
export class GetBanksModule {}
