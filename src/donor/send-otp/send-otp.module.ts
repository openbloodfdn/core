import { Module } from '@nestjs/common';
import { SendOtpController } from './send-otp.controller';
import { OTPService } from 'src/services/otp/otp.service';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';

@Module({
  controllers: [SendOtpController],
  providers: [OTPService, NeonService],
  imports: [NeonModule],
})
export class SendOtpModule {}
