import { Module } from '@nestjs/common';
import { GetDonorController } from './get-donor.controller';
import { NeonModule } from 'src/services/neon/neon.module';
import { NeonService } from 'src/services/neon/neon.service';
import { AuthService } from 'src/services/auth/auth.service';

@Module({
  controllers: [GetDonorController],
  providers: [NeonService, AuthService],
  imports: [NeonModule],
})
export class GetDonorModule {}
