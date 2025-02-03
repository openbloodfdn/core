import { Module } from '@nestjs/common';
import { BanksController } from './banks.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';

@Module({
  controllers: [BanksController],
  providers: [NeonService],
  imports: [NeonModule]
})
export class BanksModule {}
