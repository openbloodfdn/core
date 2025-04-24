import { Body, Controller, Post } from '@nestjs/common';
import { OTPService } from 'src/services/otp/otp.service';
import { NeonService } from 'src/services/neon/neon.service';
import { SMSService } from 'src/services/sms/sms.service';
import { AuthService } from 'src/services/auth/auth.service';
@Controller('donor/send-otp')
export class SendOtpController {
  /**
   * @params {string} phone
   * @params {boolean} allowSignup
   * @params {boolean} intentVerifyOTPlogin
   * @params {string} userEnteredOTP
   */
  constructor(
    private readonly neonService: NeonService,
    private readonly smsService: SMSService,
    private readonly authService: AuthService,
  ) {}
  @Post()
  async sendOTP(
    @Body()
    body: {
      phone: string;
      allowSignup: boolean;
      intentVerifyOTPlogin: boolean;
      userEnteredOTP: string;
    },
  ) {
    let { phone, allowSignup, intentVerifyOTPlogin, userEnteredOTP } = body;
    phone = phone.replace(/\s/g, '');
    phone = phone.replace('+91', '');
    if (intentVerifyOTPlogin) {
      let checkIFUserExists = await this.neonService.query(
        `SELECT phone,otp,uuid,scope FROM users WHERE phone = '${phone}';`,
      );
      if (checkIFUserExists.length === 0) {
        return { error: true, message: 'User not found' };
      } else {
        console.log(checkIFUserExists[0].otp, userEnteredOTP);
        if (parseInt(checkIFUserExists[0].otp) === parseInt(userEnteredOTP)) {
          console.log('DEBUG');
          console.log(
            await this.authService.sign(
              {
                sub: checkIFUserExists[0].uuid,
                intent: 'r',
              },
              {
                expiresIn: '30d',
              },
            ),
          );
          return {
            access: {
              token: await this.authService.sign(
                {
                  sub: checkIFUserExists[0].uuid,
                  intent: 'n',
                },
                {
                  expiresIn: '1h',
                },
              ),
              exp: Math.floor(Date.now() / 1000) + 60 * 60,
            },
            refresh: {
              token: await this.authService.sign(
                {
                  sub: checkIFUserExists[0].uuid,
                  intent: 'r',
                },
                {
                  expiresIn: '30d',
                },
              ),
              exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
            },
            error: false,
            message: 'OTP verified',
            bank: {
              id: checkIFUserExists[0].scope[0],
            },
          };
        } else {
          return { error: true, message: 'OTP incorrect' };
        }
      }
    } else {
      let checkIFUserExists = await this.neonService.query(
        `SELECT uuid FROM users WHERE phone = '${phone}';`,
      );
      if (checkIFUserExists.length === 0) {
        if (allowSignup) {
          let otp =
            process.env.inReview === 'true' &&
            process.env.reviewNumbers &&
            process.env.reviewNumbers.split(',').includes(phone)
              ? 1234
              : Math.floor(1000 + Math.random() * 9000);
          let sendOTPRecord = await this.smsService
            .send(
              phone,
              `
            Your Open Blood OTP is ${otp}`,
            )
            .catch((err) => {
              return {
                error: true,
                message: 'Error sending OTP',
              };
            });
          if (sendOTPRecord && 'sid' in sendOTPRecord) {
            console.log(sendOTPRecord.sid);
          }
          console.log(phone, otp)
          return {
            error: false,
            lookuptoken: await this.authService.sign(
              {
                sub: phone,
                otp: otp,
                intent: 'p',
              },
              {
                expiresIn: '2h',
              },
            ),
          };
        } else {
          return { error: true, message: 'User not found' };
        }
      } else {
        console.log('User exists');
        console.log(phone);
        let otp = Math.floor(1000 + Math.random() * 9000);
        if (
          process.env.inReview === 'true' &&
          process.env.reviewNumbers &&
          process.env.reviewNumbers.split(',').includes(phone)
        ) {
          otp = 1234;
        } else {
          let sendOTPRecord = await this.smsService
            .send(
              phone,
              `
            Your Open Blood OTP is ${otp}`,
            )
            .catch((err) => {
              return {
                error: true,
                message: 'Error sending OTP',
              };
            });
        }
        let setOTPRecord = this.neonService.query(
          `UPDATE users SET otp = '${otp}' WHERE phone = '${phone}';`,
        );
        return {
          error: false,
          message: 'OTP sent',
          otpSent: true,
        };
      }
    }
  }
}
