import { Module } from '@nestjs/common';
import { RefreshController } from './refresh.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';
import { AuthService } from 'src/services/auth/auth.service';

@Module({
  controllers: [RefreshController],
  providers: [NeonService, AuthService],
  imports: [NeonModule]
})
export class RefreshModule {}
