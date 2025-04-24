import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async sign(payload: any, options?: any): Promise<string> {
    return await this.jwtService.signAsync(payload, options);
  }

  async verify(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      return false;
    }
  }
  async decode(token: string): Promise<any> {
    try {
      return await this.jwtService.decode(token);
    } catch (error) {
      return false;
    }
  }
}
