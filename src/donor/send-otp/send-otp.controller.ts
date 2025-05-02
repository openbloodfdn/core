import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';
import { SMSService } from 'src/services/sms/sms.service';
import { AuthService } from 'src/services/auth/auth.service';
import { Throttle, days, minutes } from '@nestjs/throttler';
import { OtpthrottleGuard } from 'src/services/otpthrottle/otpthrottle.guard';
@Controller('donor/send-otp')
@UseGuards(OtpthrottleGuard)
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

  @Throttle(
    process.env.inReview === 'true'
      ? {
          default: {
            limit: 0,
            ttl: minutes(5),
          },
          long: {
            limit: 0,
            ttl: days(1),
          },
        }
      : {
          default: {
            limit: 4,
            ttl: minutes(5),
          },
          long: {
            limit: 8,
            ttl: days(1),
          },
        },
  )
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
          let otp = Math.floor(1000 + Math.random() * 9000);
          if (
            process.env.reviewNumbers &&
            process.env.reviewNumbers
              .split(',')
              .includes(normalizeToE164(phone))
          ) {
            console.log('In review mode, OTP is set to 1234');
            otp = 1234;
          } else {
            let sendOTPRecord = await this.smsService
              .sendOTPAutoOptIn(phone, otp)
              .catch((err) => {
                return {
                  error: true,
                  message: 'Error sending OTP',
                };
              });
            if (sendOTPRecord && 'sid' in sendOTPRecord) {
              console.log(sendOTPRecord.sid);
            }
          }
          console.log(phone, otp);
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
          process.env.reviewNumbers &&
          process.env.reviewNumbers.split(',').includes(normalizeToE164(phone))
        ) {
          otp = 1234;
        } else {
          let sendOTPRecord = await this.smsService
            .sendOTPAutoOptIn(phone, otp)
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

function normalizeToE164(rawNumber: string): string {
  console.debug(`normalizeToE164 number: ${rawNumber}`);
  let digits = rawNumber.replace(/[^\d]/g, '');

  if (digits.length === 10) {
    digits = '91' + digits;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = '91' + digits.slice(1);
  }

  if (!/^\d{11,15}$/.test(digits)) {
    console.warn(`Invalid phone number format: ${digits}`);
    return '';
  }

  console.debug(`Normalized number: ${digits}`);
  return digits;
}
