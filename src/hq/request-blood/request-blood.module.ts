import { Module } from '@nestjs/common';
import { RequestBloodController } from './request-blood.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NotificationService } from 'src/services/notification/notification.service';
import { SMSService } from 'src/services/sms/sms.service';
import { NeonModule } from 'src/services/neon/neon.module';
import { HqAuthService } from 'src/services/hq-auth/hq-auth.service';

@Module({
  controllers: [RequestBloodController],
  providers: [NeonService, NotificationService, SMSService, HqAuthService],
  imports: [NeonModule],
})
export class RequestBloodModule {}
