import { Body, Controller, Post } from '@nestjs/common';
import { DBService } from 'src/services/db/db.service';
import { TimestampService } from 'src/services/timestamp/timestamp.service';
import { NeonService } from 'src/services/neon/neon.service';

@Controller('donor/user-stats')
export class UserStatsController {
  constructor(
    private dbService: DBService,
    private timestampService: TimestampService,
    private neonService: NeonService,
  ) {}

  @Post()
  async getUserStats(@Body() body: { token: string }) {
    let { token } = body;
    if (!token) {
      return { error: true, message: 'User not found' };
    } else {
      let getUserFromToken = await this.neonService.query(
        `SELECT name,totaldonated,verified,lastdonated,created_on,log,installed,coords FROM users WHERE uuid='${token}';`,
      );
      if (getUserFromToken.length > 0) {
        //get total donators
        let totalDonators = await this.neonService.query(
          `select count(*) from users where verified='true'`,
        );
        console.log(getUserFromToken[0]);
        return {
          error: false,
          message: 'User found',
          data: {
            name: getUserFromToken[0].name,
            donated: getUserFromToken[0].totaldonated,
            lastDonated: this.timestampService.toShortString(
              getUserFromToken[0].lastdonated?.toString(),
            ),
            totalDonators: totalDonators[0].count,
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
