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
      let bbName = await this.neonService.query(
        `SELECT name,total,verified,donated FROM banks WHERE uuid='${bankCode}';`,
      );
      console.log({
        name: bbName[0].name,
        totalDonors: bbName[0].total,
        verified: bbName[0].verified,
        totalDonated: bbName[0].donated,
      })
      return {
        error: false,
        message: 'Login successful',
        data: {
          name: bbName[0].name,
          totalDonors: bbName[0].total,
          verified: bbName[0].verified,
          totalDonated: bbName[0].donated,
        },
      };
    } else {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
}