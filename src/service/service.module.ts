import { Module, forwardRef } from '@nestjs/common';
import { VendorService } from './service.service';
import { VendorController } from './service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendor } from './entities/service.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vendor, User]),
    forwardRef(() => UsersModule),
  ],
  controllers: [VendorController],
  providers: [VendorService],
  exports: [VendorService],
})
export class VendorModule {}
