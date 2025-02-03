import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';
import { NotificationService } from 'src/services/notification/notification.service';
import { SMSService } from 'src/services/sms/sms.service';
import { ExpoPushMessage } from 'expo-server-sdk';
@Controller('hq/mark-donated')
export class MarkDonatedController {
  constructor(
    private readonly neonService: NeonService,
    private readonly notificationService: NotificationService,
    private readonly smsService: SMSService,
  ) {}

  @Post()
  async markDonated(@Body() request: { token: string; uuid: string }) {
    let { token, uuid } = request;
    let envCode = process.env.HQ_TOKEN;
    if (token === `hq-${envCode}`) {
      uuid = uuid.replace('bloodbank-', '');
      let donor = await this.neonService.query(
        `SELECT name,phone,totaldonated,notification,bloodtype FROM users WHERE uuid = '${uuid}';`,
      );
      if (donor.length === 0) {
        return { error: true, message: 'Donor not found' };
      } else {
        const now = new Date();
        let updatedLog = await this.neonService.query(
          `UPDATE users SET log = log || '${JSON.stringify({
            x: `d-${donor[0].bloodtype}`,
            y: now.toISOString(),
          })}'::jsonb WHERE uuid = '${uuid}';`,
        );
        //update last donated
        let updatedDonor = await this.neonService.query(
          `UPDATE users SET lastdonated = '${now.toISOString()}' WHERE uuid = '${uuid}';`,
        );
        //add to total donated
        let newTotal = donor[0].totaldonated + 1;
        let updatedTotal = await this.neonService.query(
          `UPDATE users SET totaldonated = ${newTotal} WHERE uuid = '${uuid}';`,
        );
        //notification
        let messages: ExpoPushMessage[] = [];
        let pushToken = donor[0].notification;
        if (
          (await this.notificationService.isValidToken(pushToken)) === false
        ) {
          console.warn(
            `Push token ${pushToken} is not a valid Expo push token. Falling back to SMS.`,
          );
          let sms = await this.smsService
            .send(
              donor[0].phone,
              `Thank you for donating, ${donor[0].name.split(' ')[0]}!`,
            )
            .catch((e) => {
              console.error(
                `Error sending SMS to ${donor[0].phone}: ${e.message}`,
              );
            });
          return { error: false, message: 'Records updated' };
        }
        messages.push({
          to: pushToken,
          subtitle: `Thank you for donating, ${donor[0].name.split(' ')[0]}!`,
          body: '',
          interruptionLevel: 'critical',
          sound: {
            critical: true,
            volume: 1,
          },
        });
        let notification = await this.notificationService.batch(messages);
        return { error: false, message: 'Records updated' };
      }
    } else {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
}
