import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';
import { AuthService } from 'src/services/auth/auth.service';
import { HQRefreshGuard } from 'src/services/auth/hqrefresh.guard';

@Controller('hq/refresh')
export class HQRefreshController {
  constructor(
    private readonly neonService: NeonService,
    private readonly authService: AuthService,
  ) {}
  @UseGuards(HQRefreshGuard)
  @Post()
  async refreshToken(@Body() body: { token: string, bankCode: string }) {
    let { token } = body;
    return {
      error: false,
      message: 'Tokens rotated',
      id: token,
      access: {
        token: await this.authService.sign(
          {
            sub: token,
            intent: 'hq',
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
            sub: token,
            intent: 'hqr',
          },
          {
            expiresIn: '14d',
          },
        ),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14,
      },
    };
  }
}
