import { Module } from '@nestjs/common';
import { RequestUserDataController } from './request-user-data.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';
import { AuthService } from 'src/services/auth/auth.service';

@Module({
  controllers: [RequestUserDataController],
  providers: [NeonService, AuthService],
  imports: [NeonModule],
})
export class RequestUserDataModule {}
