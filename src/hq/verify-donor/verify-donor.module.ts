import { Module } from '@nestjs/common';
import { VerifyDonorController } from './verify-donor.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';
import { SMSService } from 'src/services/sms/sms.service';

@Module({
  controllers: [VerifyDonorController],
  providers: [NeonService, SMSService],
  imports: [NeonModule],
})
export class VerifyDonorModule {}
