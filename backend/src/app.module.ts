import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './modules/auth/auth.module';
import { WorkersModule } from './modules/workers/workers.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { SupervisorsModule } from './modules/supervisors/supervisors.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { IvrModule } from './modules/ivr/ivr.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USER', 'postgres'),
        password: config.get('DB_PASSWORD', 'password'),
        database: config.get('DB_NAME', 'labour_platform'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: config.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    WorkersModule,
    BusinessesModule,
    SupervisorsModule,
    BookingsModule,
    AttendanceModule,
    PayrollModule,
    RatingsModule,
    WhatsappModule,
    IvrModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
