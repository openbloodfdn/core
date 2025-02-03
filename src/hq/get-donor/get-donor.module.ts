import { Module } from '@nestjs/common';
import { GetDonorController } from './get-donor.controller';
import { NeonModule } from 'src/services/neon/neon.module';
import { NeonService } from 'src/services/neon/neon.service';

@Module({
  controllers: [GetDonorController],
  providers: [NeonService],
  imports: [NeonModule],
})
export class GetDonorModule {}
