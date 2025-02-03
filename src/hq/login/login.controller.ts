import { Body, Controller, Post } from '@nestjs/common';

@Controller('hq/login')
export class LoginController {
  constructor() {}

  @Post()
  async login(@Body() request: { loginCode: string }) {
    let { loginCode } = request;
    let envCode: any = process.env.HQ_SECRET;
    if (loginCode === envCode) {
      let uuid = process.env.HQ_TOKEN;
      return {
        error: false,
        message: 'Login successful',
        token: uuid,
      };
    } else {
      return { error: true, message: 'Incorrect code.' };
    }
  }
}
