import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PreAuthGuard } from 'src/services/auth/preauth.guard';
import { NeonService } from 'src/services/neon/neon.service';
import { AuthService } from 'src/services/auth/auth.service';

@Controller('donor/check-otp')
export class CheckOtpController {
  constructor(
    private readonly neonService: NeonService,
    private readonly authService: AuthService,
  ) {}
  @UseGuards(PreAuthGuard)
  @Post()
  async checkOTP(
    @Body()
    body: {
      uuid: string;
      otp: string;
      realotp: number;
      intent: string;
      existing: boolean;
    },
  ) {
    console.log('using checkotp arch')
    if (parseInt(body.otp) === body.realotp) {
      if (body.intent === 'p-e') {
        let checkIFUserExists = await this.neonService.query(
          `SELECT uuid,scope FROM users WHERE uuid = '${body.uuid}';`,
        );
        if (checkIFUserExists.length === 0) {
          return { error: true, message: 'User not found' };
        }
        console.log(
          await this.authService.sign(
            { sub: checkIFUserExists[0].uuid, intent: 'r' },
            { expiresIn: '30d' },
          ),
        );
        return {
          access: {
            token: await this.authService.sign(
              { sub: checkIFUserExists[0].uuid, intent: 'n' },
              { expiresIn: '1h' },
            ),
            exp: Math.floor(Date.now() / 1000) + 60 * 60,
          },
          refresh: {
            token: await this.authService.sign(
              { sub: checkIFUserExists[0].uuid, intent: 'r' },
              { expiresIn: '30d' },
            ),
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
          },
          error: false,
          message: 'OTP verified',
          existing: true,
          bank: { id: checkIFUserExists[0].scope[0] },
        };
      } else {
        await this.neonService.query(
          `INSERT INTO localups (uuid, loc, reqs) VALUES ('${body.uuid}', '${0},${0}', 0);`,
        );
        return { error: false, existing: false, message: 'OTP is correct' };
      }
    } else {
      return { error: true, message: 'OTP is incorrect' };
    }
  }
}
