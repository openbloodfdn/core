import { Module } from '@nestjs/common';
import { BirthdayController } from './birthday.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';
import { SMSService } from 'src/services/sms/sms.service';
import { NotificationService } from 'src/services/notification/notification.service';

@Module({
  controllers: [BirthdayController],
  providers: [NeonService, SMSService, NotificationService],
  imports: [NeonModule]
})
export class BirthdayModule {}
