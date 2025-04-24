
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';

let jwtConstant = process.env.JWT_SECRET;

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstant,
    }),
  ],
  providers: [AuthService],
  controllers: [],
  exports: [AuthService],
})
export class AuthModule {}
