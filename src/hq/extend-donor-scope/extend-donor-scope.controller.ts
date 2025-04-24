import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ExpoPushMessage } from 'expo-server-sdk';
import { AuthService } from 'src/services/auth/auth.service';
import { HQGuard } from 'src/services/auth/hq.guard';
import { HqAuthService } from 'src/services/hq-auth/hq-auth.service';
import { NeonService } from 'src/services/neon/neon.service';
import { NotificationService } from 'src/services/notification/notification.service';
import { SMSService } from 'src/services/sms/sms.service';

@Controller('hq/extend-donor-scope')
export class ExtendDonorScopeController {
  constructor(
    private readonly neonService: NeonService,
    private readonly notificationService: NotificationService,
    private readonly smsService: SMSService,
    private readonly authService: AuthService,
  ) {}
  @UseGuards(HQGuard)
  @Post()
  async extendDonorScope(
    @Body() request: { bankCode: string; token: string; uuid: string },
  ) {
    let { bankCode, token, uuid } = request;
    uuid = uuid.replace('ob-', '')
    let uuidObj = await this.authService.decode(uuid);
    if(uuidObj.intent !== 'qr') {
      throw new HttpException(
        'Invalid token',
        HttpStatus.UNAUTHORIZED,
      );
    }
    uuid = uuidObj.sub;
    uuid = uuid.replace('bloodbank-', '');
    let bankInfo = await this.neonService.query(
      `SELECT name,region FROM banks WHERE uuid = '${bankCode}';`,
    );
    let donor = await this.neonService.query(
      `SELECT name,phone,totaldonated,notification,bloodtype,scope FROM users WHERE uuid = '${uuid}';`,
    );
    if (donor.length === 0) {
      return { error: true, message: 'Donor does not exist.' };
    } else {
      let newScope = donor[0].scope;
      newScope.push(bankCode);
      let updatedScope = await this.neonService.query(
        `UPDATE users SET scope = '${JSON.stringify(newScope)}' WHERE uuid = '${uuid}';`,
      );

      //notification
      let messages: ExpoPushMessage[] = [];
      let pushToken = donor[0].notification;
      if ((await this.notificationService.isValidToken(pushToken)) === false) {
        console.warn(
          `Push token ${pushToken} is not a valid Expo push token. Falling back to SMS.`,
        );
        let sms = await this.smsService
          .send(
            donor[0].phone,
            `Hi, ${donor[0].name.split(' ')[0]}. You've been added to the ${bankInfo[0].name} blood bank donorlist in ${bankInfo[0].region}.`,
          )
          .catch((e) => {
            console.error(
              `Error sending SMS to ${donor[0].phone}: ${e.message}`,
            );
          });
        return { error: false, message: 'Records updated!' };
      }
      messages.push({
        to: pushToken,
        title: `Welcome to ${
          bankInfo[0].name
        }, ${donor[0].name.split(' ')[0]}!`,
        body: `You've been added to the ${bankInfo[0].name} blood bank donorlist in ${bankInfo[0].region}`,
        sound: {
          critical: false,
          volume: 1,
        },
      });
      let notification = await this.notificationService.batch(messages);
      return { error: false, message: 'Records updated!' };
    }
  }
}
