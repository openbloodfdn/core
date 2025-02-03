import { Module } from '@nestjs/common';
import { QueryDonorController } from './query-donor.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';

@Module({
  controllers: [QueryDonorController],
  providers: [NeonService],
  imports: [NeonModule],
})
export class QueryDonorModule {}
