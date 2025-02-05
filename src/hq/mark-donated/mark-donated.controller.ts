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
import { HqAuthService } from 'src/services/hq-auth/hq-auth.service';
@Controller('hq/mark-donated')
export class MarkDonatedController {
  constructor(
    private readonly neonService: NeonService,
    private readonly notificationService: NotificationService,
    private readonly smsService: SMSService,
    private readonly hqAuthService: HqAuthService,
  ) {}

  @Post()
  async markDonated(
    @Body() request: { bankCode: string; token: string; uuid: string },
  ) {
    let { bankCode, token, uuid } = request;
    let auth = await this.hqAuthService.authenticate(bankCode, token);
    if (auth.error === false) {
      uuid = uuid.replace('bloodbank-', '');
      let donor = await this.neonService.query(
        `SELECT name,phone,totaldonated,notification,bloodtype FROM users WHERE uuid = '${uuid}' AND scope LIKE '%"${bankCode}"%';`,
      );
      if (donor.length === 0) {
        return { error: true, message: 'Donor is out of your scope or does not exist.' };
      } else {
        const now = new Date();
        let getLog = await this.neonService.query(
          `SELECT log FROM users WHERE uuid = '${uuid}';`,
        );
        let log = getLog[0].log;
        log.push({ x: `d-${donor[0].bloodtype}`, y: now.toISOString() });
        let updatedLog = await this.neonService.query(
          `UPDATE users SET log = '${JSON.stringify(log)}' WHERE uuid = '${uuid}' AND scope LIKE '%"${bankCode}"%';`,
        );
        //update last donated
        let updatedDonor = await this.neonService.query(
          `UPDATE users SET lastdonated = '${now.toISOString()}' WHERE uuid = '${uuid}' AND scope LIKE '%"${bankCode}"%';`,
        );
        //add to total donated
        let newTotal = donor[0].totaldonated + 1;
        let updatedTotal = await this.neonService.query(
          `UPDATE users SET totaldonated = ${newTotal} WHERE uuid = '${uuid}' AND scope LIKE '%"${bankCode}"%';`,
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
          title: `Thank you for donating, ${donor[0].name.split(' ')[0]}!`,
          body: '',
          sound: {
            critical: false,
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
