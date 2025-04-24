import { Injectable } from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class HqAuthService {
  constructor(
    private readonly neonService: NeonService,
    private readonly authService: AuthService,
  ) {}
  async login(bankCode: string, token: string) {
    try {
      console.log(bankCode, token);
      token = token.replace('hq-', '');
      console.log(bankCode, token);
      const secretResult = await this.neonService.query(
        `SELECT secret FROM banks WHERE uuid = '${bankCode}';`,
      );
      if (!secretResult || secretResult.length === 0) {
        return { error: true, message: 'Bank not found.' };
      }
      const isValid = await bcrypt.compare(token, secretResult[0].secret);
      if (isValid) {
        console.log('HQ: Login successful');
        return {
          error: false,
          message: 'Login successful',
          id: bankCode,
          access: {
            token: await this.authService.sign(
              {
                sub: bankCode,
                intent: 'hq',
              },
              {
                //expiresIn: '1h',
                expiresIn: '1h'
              },
            ),
            exp: Math.floor(Date.now() / 1000) + 60*60
          },
          refresh: {
            token: await this.authService.sign(
              {
                sub: bankCode,
                intent: 'hqr',
              },
              {
                expiresIn: '14d',
              },
            ),
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14,
          },
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

  async authenticate(bankCode: string, token: string) {
    try {
      if ((await this.authService.verify(token)) !== false) {
        let decoded = await this.authService.decode(token);
        if (decoded !== false && decoded.sub !== bankCode) {
          return { error: true, message: 'Token is invalid.' };
        }
        console.log('HQ: Token is valid');
        return {
          error: false,
          message: 'Token is valid',
          id: bankCode,
        };
      } else {
        console.log('HQ: Token is invalid');
        return { error: true, message: 'Token is invalid.' };
      }
    } catch (error) {
      console.log(error);
      return { error: true, message: 'Authentication error.' };
    }
  }
}
