import { Module } from '@nestjs/common';
import { LoginController } from './login.controller';
import { NeonModule } from 'src/services/neon/neon.module';
import { NeonService } from 'src/services/neon/neon.service';
import { HqAuthService } from 'src/services/hq-auth/hq-auth.service';

@Module({
  controllers: [LoginController],
  providers: [NeonService, HqAuthService],
  imports: [NeonModule],
})
export class LoginModule {}
