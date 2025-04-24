import { Module } from '@nestjs/common';
import { QRController } from './qr.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';
import { AuthService } from 'src/services/auth/auth.service';

@Module({
  controllers: [QRController],
  providers: [NeonService, AuthService],
  imports: [NeonModule]
})
export class QRModule {}
