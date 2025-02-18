import { Body, Controller, Post } from '@nestjs/common';
import { DBService } from 'src/services/db/db.service';
import { TimestampService } from 'src/services/timestamp/timestamp.service';
import { NeonService } from 'src/services/neon/neon.service';

@Controller('donor/user-stats')
export class UserStatsController {
  constructor(
    private readonly timestampService: TimestampService,
    private readonly neonService: NeonService,
  ) {}

  @Post()
  async getUserStats(@Body() body: { token: string }) {
    let { token } = body;
    if (!token) {
      return { error: true, message: 'User not found' };
    } else {
      let getUserFromToken = await this.neonService.query(
        `SELECT name,totaldonated,verified,lastdonated,created_on,log,installed,coords,scope FROM users WHERE uuid='${token}';`,
      );
      let getbankdata = await this.neonService.query(
        `SELECT name,phone FROM banks WHERE uuid='${getUserFromToken[0].scope[0]}';`,
      );
      if (getUserFromToken.length > 0) {
        //get total donators
        let totalDonators = await this.neonService.query(
          `SELECT COUNT(*) FROM users WHERE scope LIKE '%"${getUserFromToken[0].scope[0]}"%';`,
        );
        return {
          error: false,
          message: 'User found',
          data: {
            name: getUserFromToken[0].name,
            bank: {
              name: getbankdata[0].name,
              phone: getbankdata[0].phone,
            },
            donated: getUserFromToken[0].totaldonated,
            lastDonated: this.timestampService.toShortString(
              getUserFromToken[0].lastdonated?.toString(),
            ),
            totalDonators: totalDonators[0]['COUNT(*)'],
            donatingSince: this.timestampService.toShortString(
              getUserFromToken[0].created_on?.toString(),
            ),
            verified: getUserFromToken[0].verified,
            log: getUserFromToken[0].log,
            installed: getUserFromToken[0].installed,
            coords: getUserFromToken[0].coords,
          },
        };
      } else {
        return { error: true, message: 'User not found' };
      }
    }
  }
}
