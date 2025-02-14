import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Service } from '../service/entities/service.entity';
import { User } from '../users/entities/user.entity';
import { ServiceApplication } from '../service-application/entities/service-application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, User, ServiceApplication])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
