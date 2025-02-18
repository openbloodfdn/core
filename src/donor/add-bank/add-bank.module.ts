import { Module } from '@nestjs/common';
import { AddBankController } from './add-bank.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';

@Module({
  controllers: [AddBankController],
  providers: [NeonService],
  imports: [NeonModule],
})
export class AddBankModule {}
