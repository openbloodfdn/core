import { Module } from '@nestjs/common';
import { GetDonorController } from './get-donor.controller';
import { NeonModule } from 'src/services/neon/neon.module';
import { NeonService } from 'src/services/neon/neon.service';
import { HqAuthService } from 'src/services/hq-auth/hq-auth.service';

@Module({
  controllers: [GetDonorController],
  providers: [NeonService, HqAuthService],
  imports: [NeonModule],
})
export class GetDonorModule {}
