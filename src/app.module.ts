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
import { ReviewModule } from './review/review.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { AdminController } from './admin/admin.controller';
import { SeedService } from './database/seed.service';
import { AdminService } from './admin/admin.service';
import { AdminModule } from './admin/admin.module';
import { ServiceApplicationModule } from './service-application/service-application.module';

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
    ReviewModule,
    CloudinaryModule,
    AdminModule,
    ServiceApplicationModule,
  ],
  controllers: [AppController, AdminController],
  providers: [AppService, SeedService, AdminService],
})
export class AppModule {}
