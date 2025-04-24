import { Module } from '@nestjs/common';
import { VerifyDonorController } from './verify-donor.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';
import { SMSService } from 'src/services/sms/sms.service';
import { NotificationService } from 'src/services/notification/notification.service';
import { AuthService } from 'src/services/auth/auth.service';

@Module({
  controllers: [VerifyDonorController],
  providers: [NeonService, SMSService, NotificationService, AuthService],
  imports: [NeonModule],
})
export class VerifyDonorModule {}
