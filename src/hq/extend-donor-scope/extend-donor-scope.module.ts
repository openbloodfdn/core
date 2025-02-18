import { Module } from '@nestjs/common';
import { ExtendDonorScopeController } from './extend-donor-scope.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NotificationService } from 'src/services/notification/notification.service';
import { SMSService } from 'src/services/sms/sms.service';
import { HqAuthService } from 'src/services/hq-auth/hq-auth.service';
import { NeonModule } from 'src/services/neon/neon.module';

@Module({
  controllers: [ExtendDonorScopeController],
  providers: [NeonService, NotificationService, SMSService, HqAuthService],
  imports: [NeonModule],
})
export class ExtendDonorScopeModule {}
