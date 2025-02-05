import { Body, Controller, Post } from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';
import * as bcrypt from 'bcrypt';
import { HqAuthService } from 'src/services/hq-auth/hq-auth.service';
@Controller('hq/login')
export class LoginController {
  constructor(private readonly hqAuthService: HqAuthService) {}

  @Post()
  async login(@Body() request: { bankCode: string; loginCode: string }) {
    let { bankCode, loginCode } = request;
    let result = await this.hqAuthService.authenticate(bankCode, loginCode);
    console.log(result)
    return result;
  }
}
