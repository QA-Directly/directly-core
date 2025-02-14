import { Module, forwardRef } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, User]),
    forwardRef(() => UsersModule),
    CloudinaryModule,
  ],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [ServiceService, TypeOrmModule],
})
export class ServiceModule {}
