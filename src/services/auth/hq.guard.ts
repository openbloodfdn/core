import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
let jwtConstants = process.env.JWT_SECRET;
import { Request } from 'express';

@Injectable()
export class HQGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('hq guard');
    const request = context.switchToHttp().getRequest();

    console.log(request.body);
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants,
      });
      request.body.token = payload.sub;
      request.body.intent = payload.intent;
      if (payload.intent !== 'hq' && request.body.bankCode === payload.sub) {
        console.log('non-hq token blocked');
        throw new UnauthorizedException();
      }
    } catch {
      throw new UnauthorizedException();
    }

    console.log('hq token allowed');
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    console.log(token)
    return type === 'Bearer' ? token : undefined;
  }
}
