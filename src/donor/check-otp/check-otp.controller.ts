import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PreAuthGuard } from 'src/services/auth/preauth.guard';
import { NeonService } from 'src/services/neon/neon.service';

@Controller('donor/check-otp')
export class CheckOtpController {
  constructor(
    private readonly neonService: NeonService,
  ) {}
  @UseGuards(PreAuthGuard)
  @Post()
  async checkOTP(@Body() body: { uuid: string; otp: string; realotp: number }) {
    if (parseInt(body.otp) === body.realotp) {
      await this.neonService.query(
        `INSERT INTO localups (uuid, loc, reqs) VALUES ('${body.uuid}', '${0},${0}', 0);`,
      );
      return { error: false, message: 'OTP is correct' };

    } else {
      return { error: true, message: 'OTP is incorrect' };
    }
  }
}
