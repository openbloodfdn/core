import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';
import { SMSService } from 'src/services/sms/sms.service';
import { NotificationService } from 'src/services/notification/notification.service';
import { ExpoPushMessage } from 'expo-server-sdk';
import { HQGuard } from 'src/services/auth/hq.guard';

@Controller('donor/birthday')
export class BirthdayController {
  constructor(
    private readonly neonService: NeonService,
    private readonly smsService: SMSService,
    private readonly notificationService: NotificationService,
  ) {}
  
  @UseGuards(HQGuard)
  @Post()
  async sendBirthdayAlerts(@Body() body: { token: string }) {
    const query = `SELECT name,notification,phone FROM users WHERE dob::date = CURRENT_DATE;`;
    const users = await this.neonService.query(query);
    let notificationBatch: ExpoPushMessage[] = [];
    let smsBatch: {
      phone: string;
      message: string;
    }[] = [];
    for (const user of users) {
      const { name, notification, phone } = user;
      if (await this.notificationService.isValidToken(notification)) {
        notificationBatch.push({
          to: notification,
          sound: {
            name: 'default',
            volume: 1,
          },
          title: `Happy Birthday, ${name.split(' ')[0]}!`,
          body: `Celebrate your special day by donating blood!`,
        });
      } else {
        // TODO: Get this back up
        /*await this.smsService.sendMessage({
          phone: phone,
          message: `Happy Birthday, ${name.split(' ')[0]}! Celebrate your special day by donating blood!`,
        });*/
      }
    }
    return { success: true, count: users.length, users };
  }
}
