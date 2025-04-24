import { Module } from '@nestjs/common';
import { QueryDonorController } from './query-donor.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';
import { AuthService } from 'src/services/auth/auth.service';

@Module({
  controllers: [QueryDonorController],
  providers: [NeonService, AuthService],
  imports: [NeonModule],
})
export class QueryDonorModule {}
