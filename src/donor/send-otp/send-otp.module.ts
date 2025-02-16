import { Module } from '@nestjs/common';
import { SendOtpController } from './send-otp.controller';
import { OTPService } from 'src/services/otp/otp.service';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';
import { SMSService } from 'src/services/sms/sms.service';

@Module({
  controllers: [SendOtpController],
  providers: [OTPService, NeonService, SMSService],
  imports: [NeonModule],
})
export class SendOtpModule {}
