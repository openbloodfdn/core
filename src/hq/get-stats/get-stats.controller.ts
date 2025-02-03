import { Body, Controller, HttpCode, HttpException, HttpStatus, Post } from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';
import { request } from 'http';

@Controller('hq/get-stats')
export class GetStatsController {
  constructor(
    private readonly neonService: NeonService,
  ) {}

  @Post()
  async getStats(@Body() request: { loginCode: string }) {
    let { loginCode } = request;
    let envCode = process.env.HQ_TOKEN;
    if (loginCode === `hq-${envCode}`) {
      /**
       * return:
       * totaldonors:
       * totaldonated:
       */
      let totalDonators = await this.neonService.query(
        `SELECT verified FROM users;`,
      );
      let totalDonated = await this.neonService.query(
        `SELECT SUM(totaldonated) FROM users;`,
      );
      return {
        error: false,
        message: 'Login successful',
        data: {
          totalDonors: totalDonators,
          totalDonated: totalDonated[0].sum,
        },
      };
    } else {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
}
