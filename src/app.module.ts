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


@Module({
  imports: [SendOtpModule, ConfigModule.forRoot(), UserStatsModule, NeonModule, SignupModule, UpdateLocationModule, UpdateNotificationsModule, LoginModule, GetDonorModule, GetStatsModule, VerifyDonorModule, RequestUserDataModule, RejectDonorModule, QueryDonorModule, MarkDonatedModule, GeocodeLocationModule, RequestBloodModule, BirthdayModule, BanksModule],
  controllers: [AppController],
  providers: [AppService, DBService, OTPService, TimestampService, NeonService, SMSService, NotificationService],
})
export class AppModule {}
