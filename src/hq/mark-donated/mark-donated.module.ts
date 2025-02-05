import { Module } from '@nestjs/common';
import { MarkDonatedController } from './mark-donated.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NotificationService } from 'src/services/notification/notification.service';
import { NeonModule } from 'src/services/neon/neon.module';
import { SMSService } from 'src/services/sms/sms.service';
import { HqAuthService } from 'src/services/hq-auth/hq-auth.service';

@Module({
  controllers: [MarkDonatedController],
  providers: [NeonService, NotificationService, SMSService, HqAuthService],
  imports: [NeonModule],
})
export class MarkDonatedModule {}
