import { Module } from '@nestjs/common';
import { SignupController } from './signup.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';
import { AuthService } from 'src/services/auth/auth.service';
import { EmailService } from 'src/services/email/email.service';

@Module({
  controllers: [SignupController],
  providers: [NeonService, AuthService, EmailService],
  imports: [NeonModule],
})
export class SignupModule {}
