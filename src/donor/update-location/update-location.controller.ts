import { Body, Controller, Post } from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';

@Controller('donor/update-location')
export class UpdateLocationController {
  constructor(private readonly neonService: NeonService) {}

  @Post()
  async updateLocation(
    @Body()
    request: {
      uuid: string;
      distance: number;
      dob: string;
      coords: string;
      lookupid: string;
    },
  ) {
    let { uuid, distance, coords, lookupid } = request;
    console.log(
      `EXP: ${uuid} is ${distance} km away, coords/address: ${coords}`,
    );
    if (!uuid) {
      return { error: true, message: 'User not found' };
    } else {
      let user = await this.neonService.query(
        `SELECT installed,uuid FROM users WHERE uuid = '${uuid}';`,
      );
      if (user.length > 0) {
        await this.neonService.query(
          `UPDATE users SET distance = '${distance}' WHERE uuid = '${uuid}';`,
        );
        await this.neonService.query(
          `UPDATE users SET dob = '${request.dob}' WHERE uuid = '${uuid}';`,
        );
        await this.neonService.query(
          `UPDATE users SET coords = '${coords}' WHERE uuid = '${uuid}';`,
        );
        if (user[0].installed === false) {
          await this.neonService.query(
            `UPDATE users SET installed = true WHERE uuid = '${uuid}';`,
          );
        }
        if (lookupid !== '') {
          await this.neonService.query(
            `DELETE FROM localups WHERE uuid = '${lookupid}';`,
          );
        }
        return { error: false, message: 'Distance updated!' };
      } else {
        return { error: true, message: 'User not found' };
      }
    }
  }
}
