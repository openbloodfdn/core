import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/services/auth/auth.guard';
import { NeonService } from 'src/services/neon/neon.service';

@Controller('donor/update-notifications')
export class UpdateNotificationsController {
  constructor(private readonly neonService: NeonService) {}
  @UseGuards(AuthGuard)
  @Post()
  async updateNotifications(
    @Body() request: { uuid: string; notificationToken: string; os: string },
  ) {
    let { uuid, notificationToken } = request;
    let donor = await this.neonService.query(
      `SELECT notification FROM users WHERE uuid = '${uuid}';`,
    );
    if (donor.length === 0) {
      return { error: true, message: 'Donor not found' };
    } else if (donor[0].notification != notificationToken) {
      await this.neonService.query(
        `UPDATE users SET notification= '${notificationToken}', os = '${request.os}' WHERE uuid = '${uuid}';`,
      );
      return {
        error: false,
        message: 'Notifications are enabled!',
      };
    } else {
      return {
        error: false,
        message: 'Notifications are already enabled.',
      };
    }
  }
}
