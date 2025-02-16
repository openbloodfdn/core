import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';
import { request } from 'http';
import { HqAuthService } from 'src/services/hq-auth/hq-auth.service';

@Controller('hq/get-stats')
export class GetStatsController {
  constructor(
    private readonly neonService: NeonService,
    private readonly hqAuthService: HqAuthService,
  ) {}

  @Post()
  async getStats(@Body() request: { bankCode: string; loginCode: string }) {
    let { bankCode, loginCode } = request;
    let auth = await this.hqAuthService.authenticate(bankCode, loginCode);
    if (auth.error === false) {
      /**
       * return:
       * totaldonors:
       * totaldonated:
       */
      let totalDonators = await this.neonService.query(
        `SELECT verified FROM users WHERE scope LIKE '%"${bankCode}"%';`,
      );
      let bbName = await this.neonService.query(
        `SELECT name FROM banks WHERE uuid='${bankCode}';`,
      );
      let totalDonated = await this.neonService.query(
        `SELECT SUM(totaldonated) FROM users WHERE scope LIKE '%"${bankCode}"%';`,
      );
      return {
        error: false,
        message: 'Login successful',
        data: {
          name: bbName[0].name,
          totalDonors: totalDonators,
          totalDonated: totalDonated[0]['SUM(totaldonated)'],
        },
      };
    } else {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
}
