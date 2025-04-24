import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { DBService } from 'src/services/db/db.service';
import { TimestampService } from 'src/services/timestamp/timestamp.service';
import { NeonService } from 'src/services/neon/neon.service';
import { AuthGuard } from 'src/services/auth/auth.guard';

@Controller('donor/get-banks')
export class GetBanksController {
  constructor(
    private readonly timestampService: TimestampService,
    private readonly neonService: NeonService,
  ) {}
  @UseGuards(AuthGuard)
  @Post()
  async getBanks(@Body() body: { uuid: string }) {
    let { uuid } = body;
    if (!uuid) {
      return { error: true, message: 'User not found' };
    } else {
      let getUserFromToken = await this.neonService.query(
        `SELECT scope FROM users WHERE uuid='${uuid}';`,
      );
      if (getUserFromToken.length > 0) {  
        let getBankData = await this.neonService.query(
          `SELECT uuid,name,phone,region FROM banks WHERE uuid IN (${getUserFromToken[0].scope.map((s) => `'${s}'`).join(',')});`,
        );
        console.log(getBankData);
        return {
          error: false,
          message: 'found',
          data: getBankData,
        };
      } else {
        return { error: true, message: 'User not found' };
      }
    }
  }
}
