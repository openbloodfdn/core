import { Body, Controller, Post } from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';

@Controller('donor/update-notifications')
export class UpdateNotificationsController {
  constructor(private readonly neonService: NeonService) {}

  @Post()
  async updateNotifications(
    @Body() request: { uuid: string; notificationToken: string },
  ) {
    let { uuid, notificationToken } = request;
    let donor = await this.neonService.query(
      `SELECT * FROM users WHERE uuid = '${uuid}';`,
    );
    if (donor.length === 0) {
      return { error: true, message: 'Donor not found' };
    } else {
      await this.neonService.query(
        `UPDATE users SET notification= '${notificationToken}' WHERE uuid = '${uuid}';`,
      );
      return {
        error: false,
        message: 'Notifications are enabled!',
      };
    }
  }
}
