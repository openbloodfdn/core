import { Module } from '@nestjs/common';
import { UpdateNotificationsController } from './update-notifications.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';

@Module({
  controllers: [UpdateNotificationsController],
  providers: [NeonService],
  imports: [NeonModule],
})
export class UpdateNotificationsModule {}
