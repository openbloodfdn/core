import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SendOtpModule } from './donor/send-otp/send-otp.module';
import { OTPService } from './services/otp/otp.service';
import { DBService } from './services/db/db.service';
import { ConfigModule } from '@nestjs/config';
import { UserStatsModule } from './donor/user-stats/user-stats.module';
import { TimestampService } from './services/timestamp/timestamp.service';
import { NeonModule } from './services/neon/neon.module';
import { NeonService } from './services/neon/neon.service';
import { SignupModule } from './donor/signup/signup.module';
import { UpdateLocationModule } from './donor/update-location/update-location.module';
import { UpdateNotificationsModule } from './donor/update-notifications/update-notifications.module';
import { LoginModule } from './hq/login/login.module';
import { GetDonorModule } from './hq/get-donor/get-donor.module';
import { GetStatsModule } from './hq/get-stats/get-stats.module';
import { VerifyDonorModule } from './hq/verify-donor/verify-donor.module';
import { SMSService } from './services/sms/sms.service';
import { RequestUserDataModule } from './hq/request-user-data/request-user-data.module';
import { RejectDonorModule } from './hq/reject-donor/reject-donor.module';
import { QueryDonorModule } from './hq/query-donor/query-donor.module';
import { MarkDonatedModule } from './hq/mark-donated/mark-donated.module';
import { NotificationService } from './services/notification/notification.service';
import { GeocodeLocationModule } from './donor/geocode-location/geocode-location.module';
import { RequestBloodModule } from './hq/request-blood/request-blood.module';
import { BirthdayModule } from './donor/birthday/birthday.module';
import { BanksModule } from './donor/banks/banks.module';
import { CreateBankModule } from './hq/create-bank/create-bank.module';
import { HqAuthService } from './services/hq-auth/hq-auth.service';
import { ExtendDonorScopeModule } from './hq/extend-donor-scope/extend-donor-scope.module';
import { GetBanksModule } from './donor/get-banks/get-banks.module';
import { RemoveBankModule } from './donor/remove-bank/remove-bank.module';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { AddBankModule } from './donor/add-bank/add-bank.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { RegenerateIdModule } from './donor/regenerate-id/regenerate-id.module';
import { RefreshModule } from './donor/refresh/refresh.module';
import { AuthService } from './services/auth/auth.service';
import { HQRefreshModule } from './hq/refresh/refresh.module';
import { BxService } from './services/bx/bx.service';
import { QRModule } from './donor/qr/qr.module';
import { CheckOtpModule } from './donor/check-otp/check-otp.module';
import {
  minutes,
  seconds,
  ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: seconds(1),
          limit: 5,
        },
        {
          name: 'long',
          ttl: minutes(1),
          limit: 100, // 100 requests per minute
        },
      ],
    }),
    SendOtpModule,
    UserStatsModule,
    NeonModule,
    SignupModule,
    UpdateLocationModule,
    UpdateNotificationsModule,
    LoginModule,
    GetDonorModule,
    GetStatsModule,
    VerifyDonorModule,
    RequestUserDataModule,
    RejectDonorModule,
    QueryDonorModule,
    MarkDonatedModule,
    GeocodeLocationModule,
    RequestBloodModule,
    BirthdayModule,
    BanksModule,
    CreateBankModule,
    ExtendDonorScopeModule,
    GetBanksModule,
    RemoveBankModule,
    AddBankModule,
    RegenerateIdModule,
    RefreshModule,
    HQRefreshModule,
    QRModule,
    CheckOtpModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
    DBService,
    OTPService,
    TimestampService,
    NeonService,
    SMSService,
    NotificationService,
    HqAuthService,
    AuthService,
    BxService,
  ],
})
export class AppModule {}
