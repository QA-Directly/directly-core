import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceApplication } from './entities/service-application.entity';
import { ServiceApplicationService } from './service-application.service';
import { Service } from '../service/entities/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceApplication, Service])],
  providers: [ServiceApplicationService],
  exports: [ServiceApplicationService, TypeOrmModule],
})
export class ServiceApplicationModule {}
