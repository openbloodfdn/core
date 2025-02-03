import { Module } from '@nestjs/common';
import { RejectDonorController } from './reject-donor.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';
import { SMSService } from 'src/services/sms/sms.service';

@Module({
  controllers: [RejectDonorController],
  providers: [NeonService, SMSService],
  imports: [NeonModule],
})
export class RejectDonorModule {}
