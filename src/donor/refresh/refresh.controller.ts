import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DBService } from 'src/services/db/db.service';
import { TimestampService } from 'src/services/timestamp/timestamp.service';
import { NeonService } from 'src/services/neon/neon.service';
import { AuthService } from 'src/services/auth/auth.service';
import { RefreshGuard } from 'src/services/auth/refresh.guard';

@Controller('donor/refresh')
export class RefreshController {
  constructor(
    private readonly neonService: NeonService,
    private readonly authService: AuthService,
  ) {}
  @UseGuards(RefreshGuard)
  @Post()
  async refreshToken(@Body() body: { uuid: string }) {
    let { uuid } = body;
    if (!uuid) {
      return { error: true, message: 'User not found' };
    } else {
      let getUserFromToken = await this.neonService.query(
        `SELECT uuid FROM users WHERE uuid='${uuid}';`,
      );
      if (getUserFromToken.length > 0) {
        return {
          access: {
            token: await this.authService.sign(
              {
                sub: getUserFromToken[0].uuid,
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
                sub: getUserFromToken[0].uuid,
                intent: 'r',
              },
              {
                expiresIn: '30d',
              },
            ),
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
          },
          error: false,
          message: 'Tokens rotated',
        };
      } else {
        return { error: true, message: 'User not found' };
      }
    }
  }
}
