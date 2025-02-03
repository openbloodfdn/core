import { Module } from '@nestjs/common';
import { SignupController } from './signup.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';

@Module({
  controllers: [SignupController],
  providers: [NeonService],
  imports: [NeonModule],
})
export class SignupModule {}
