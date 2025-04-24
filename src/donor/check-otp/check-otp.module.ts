import { Module } from '@nestjs/common';
import { CheckOtpController } from './check-otp.controller';
import { NeonService } from 'src/services/neon/neon.service';

@Module({
  controllers: [CheckOtpController],
  providers: [NeonService],
})
export class CheckOtpModule {}
