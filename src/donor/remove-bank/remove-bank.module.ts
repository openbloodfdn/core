import { Module } from '@nestjs/common';
import { RemoveBankController } from './remove-bank.controller';
import { NeonModule } from 'src/services/neon/neon.module';
import { NeonService } from 'src/services/neon/neon.service';

@Module({
  controllers: [RemoveBankController],
  providers: [NeonService],
  imports: [NeonModule]
})
export class RemoveBankModule {}
