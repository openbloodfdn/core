import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';
import { HqAuthService } from 'src/services/hq-auth/hq-auth.service';
import { HQGuard } from 'src/services/auth/hq.guard';

@Controller('hq/get-stats')
export class GetStatsController {
  constructor(
    private readonly neonService: NeonService,
  ) {}
  @UseGuards(HQGuard)
  @Post()
  async getStats(@Body() request: { bankCode: string; token: string }) {
    console.log(request);
    let { bankCode, token } = request;
    /**
     * return:
     * totaldonors:
     * totaldonated:
     */
    let bbName = await this.neonService.query(
      `SELECT name,total,verified,donated FROM banks WHERE uuid='${bankCode}';`,
    );

    /*let ageTrend = await this.neonService.query(`
        SELECT 
  CASE
    WHEN (strftime('%Y', 'now') - strftime('%Y', dob)) BETWEEN 18 AND 25 THEN '18-25'
    WHEN (strftime('%Y', 'now') - strftime('%Y', dob)) BETWEEN 26 AND 35 THEN '26-35'
    WHEN (strftime('%Y', 'now') - strftime('%Y', dob)) BETWEEN 36 AND 45 THEN '36-45'
    WHEN (strftime('%Y', 'now') - strftime('%Y', dob)) BETWEEN 46 AND 60 THEN '46-60'
    ELSE '60+'
  END AS age_group,
  COUNT(*) AS total_donors
FROM users
WHERE scope LIKE '%"${bankCode}"%'
GROUP BY age_group;
`);*/
    console.log({
      name: bbName[0].name,
      totalDonors: bbName[0].total,
      verified: bbName[0].verified,
      totalDonated: bbName[0].donated,
    });
    return {
      error: false,
      message: 'Login successful',
      data: {
        name: bbName[0].name,
        totalDonors: bbName[0].total,
        verified: bbName[0].verified,
        totalDonated: bbName[0].donated,
        //ages: ageTrend,
      },
    };
  }
}
