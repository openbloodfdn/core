import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DBService } from 'src/services/db/db.service';
import { TimestampService } from 'src/services/timestamp/timestamp.service';
import { NeonService } from 'src/services/neon/neon.service';
import { AuthService } from 'src/services/auth/auth.service';
import { RefreshGuard } from 'src/services/auth/refresh.guard';
import { AuthGuard } from 'src/services/auth/auth.guard';

@Controller('donor/qr')
export class QRController {
  constructor(
    private readonly neonService: NeonService,
    private readonly authService: AuthService,
  ) {}
  @UseGuards(AuthGuard)
  @Post()
  async refreshToken(@Body() body: { uuid: string }) {
    let { uuid } = body;
    if (!uuid) {
      return { error: true, message: 'User not found' };
    } else {
      return {
        access: {
          token: await this.authService.sign(
            {
              sub: uuid,
              intent: 'qr',
            },
            {
              expiresIn: '60s',
            },
          ),
          exp: Math.floor(Date.now() / 1000) + 60,
        },
        error: false,
      };
    }
  }
}
