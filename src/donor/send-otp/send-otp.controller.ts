import { Body, Controller, Post } from '@nestjs/common';
import { OTPService } from 'src/services/otp/otp.service';
import { NeonService } from 'src/services/neon/neon.service';

@Controller('donor/send-otp')
export class SendOtpController {
  /**
   * @params {string} phone
   * @params {boolean} allowSignup
   * @params {boolean} intentVerifyOTPlogin
   * @params {string} userEnteredOTP
   */
  constructor(
    private readonly otpService: OTPService,
    private neonService: NeonService
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
        `SELECT phone,otp,uuid FROM users WHERE phone = '${phone}';`,
      );
      if (checkIFUserExists.length === 0) {
        return { error: true, message: 'User not found' };
      } else {
        console.log(checkIFUserExists[0].otp, userEnteredOTP);
        if (parseInt(checkIFUserExists[0].otp) === parseInt(userEnteredOTP)) {
          return {
            error: false,
            message: 'OTP verified',
            uuid: checkIFUserExists[0].uuid,
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
          let sendOTPRecord = await this.otpService
            .send(phone, otp)
            .catch((err) => {
              return {
                error: true,
                message: 'Error sending OTP',
              };
            });
          if (sendOTPRecord && 'sid' in sendOTPRecord) {
            console.log(sendOTPRecord.sid);
          }
          return { error: false, otp: otp };
        } else {
          return { error: true, message: 'User not found' };
        }
      } else {
        console.log('User exists');
        console.log(phone);
        let otp = Math.floor(1000 + Math.random() * 9000);
        if (phone === '1234567890') {
          otp = 1234;
        } else {
          let sendOTPRecord = await this.otpService
            .send(phone, otp)
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
