import { Module } from '@nestjs/common';
import { SmsreportController } from './smsreport.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';
import { EmailService } from 'src/services/email/email.service';

@Module({
  controllers: [SmsreportController],
  providers: [NeonService, EmailService],
  imports: [NeonModule],
})
export class SmsreportModule {}
