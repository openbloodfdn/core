import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';
import { NotificationService } from 'src/services/notification/notification.service';
import { SMSService } from 'src/services/sms/sms.service';
import { ExpoPushMessage } from 'expo-server-sdk';
import { HQGuard } from 'src/services/auth/hq.guard';
import { AuthService } from 'src/services/auth/auth.service';
@Controller('hq/mark-donated')
export class MarkDonatedController {
  constructor(
    private readonly neonService: NeonService,
    private readonly notificationService: NotificationService,
    private readonly smsService: SMSService,
    private readonly authService: AuthService,
  ) {}
  @UseGuards(HQGuard)
  @Post()
  async markDonated(
    @Body() request: { bankCode: string; token: string; uuid: string },
  ) {
    let { bankCode, uuid } = request;
    uuid = uuid.replace('ob-', '');
    let donor = await this.neonService.query(
      `SELECT name,phone,totaldonated,notification,bloodtype,scope FROM users WHERE uuid = '${uuid}';`, //AND scope LIKE '%"${bankCode}"%';`,
    );
    if (donor.length === 0) {
      return { error: true, message: 'Donor does not exist.' };
    } else {
      const now = new Date();
      let getLog = await this.neonService.query(
        `SELECT log FROM users WHERE uuid = '${uuid}';`,
      );
      let log = getLog[0].log;
      log.push({ x: `d-${donor[0].bloodtype}`, y: now.toISOString() });
      await this.neonService.query(
        `UPDATE users SET log = '${JSON.stringify(log)}' WHERE uuid = '${uuid}';`, //AND scope LIKE '%"${bankCode}"%';`,
      );
      //update last donated
      let updatedDonor = await this.neonService.query(
        `UPDATE users SET lastdonated = '${now.toISOString()}' WHERE uuid = '${uuid}';`, // AND scope LIKE '%"${bankCode}"%';`,
      );
      //add to total donated
      let newTotal = donor[0].totaldonated + 1;
      await this.neonService.query(
        `UPDATE users SET totaldonated = ${newTotal} WHERE uuid = '${uuid}';`, // AND scope LIKE '%"${bankCode}"%';`,
      );
      //update bank
      await this.neonService.query(
        `UPDATE banks SET donated = donated + 1 WHERE uuid = '${bankCode}';`,
      );
      //notification
      let messages: ExpoPushMessage[] = [];
      let pushToken = donor[0].notification;
      if ((await this.notificationService.isValidToken(pushToken)) === false) {
        console.warn(
          `Push token ${pushToken} is not a valid Expo push token. Falling back to SMS.`,
        );
        let sms = await this.smsService
          .sendMessage({
            phone: donor[0].phone,
            message: `Thank you for donating, ${donor[0].name.split(' ')[0]}!`,
          })
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
  }
}
