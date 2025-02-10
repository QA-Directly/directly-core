import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { BookingModule } from './booking/booking.module';
import { ServiceModule } from './service/service.module';
import { Service } from './service/entities/service.entity';
import { Booking } from './booking/entities/booking.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.getOrThrow<string>('DATABASE_URL'),
        synchronize: false,
        entities: [User, Service, Booking],
        useUnifiedTopology: true,
        autoLoadEntities: true,
      }),
    }),
    UsersModule,
    AuthModule,
    ServiceModule,
    BookingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
