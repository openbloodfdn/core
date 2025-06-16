import { Module } from '@nestjs/common';
import { CheckOtpController } from './check-otp.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { AuthService } from 'src/services/auth/auth.service';
@Module({
  controllers: [CheckOtpController],
  providers: [NeonService, AuthService],
})
export class CheckOtpModule {}
