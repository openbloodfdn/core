import { Injectable } from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HqAuthService {
  constructor(private readonly neonService: NeonService) {}

  async authenticate(bankCode: string, loginCode: string) {
    try {
      loginCode = loginCode.replace('hq-', '');
      console.log(bankCode, loginCode);
      const secretResult = await this.neonService.query(
        `SELECT secret FROM banks WHERE uuid = '${bankCode}';`,
      );
      if (!secretResult || secretResult.length === 0) {
        return { error: true, message: 'Bank not found.' };
      }
      const isValid = await bcrypt.compare(loginCode, secretResult[0].secret);
      if (isValid) {
        console.log('HQ: Login successful');
        return {
          error: false,
          message: 'Login successful',
          id: bankCode,
        };
      } else {
        console.log('HQ: Incorrect code');
        return { error: true, message: 'Incorrect code.' };
      }
    } catch (error) {
      console.log(error);
      return { error: true, message: 'Authentication error.' };
    }
  }
}
