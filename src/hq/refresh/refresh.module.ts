import { Module } from '@nestjs/common';
import { HQRefreshController } from './refresh.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { AuthService } from 'src/services/auth/auth.service';
import { NeonModule } from 'src/services/neon/neon.module';

@Module({
  controllers: [HQRefreshController],
  providers: [NeonService, AuthService],
  imports: [NeonModule],
})
export class HQRefreshModule {}
