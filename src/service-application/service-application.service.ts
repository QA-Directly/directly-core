import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateServiceApplicationDto } from './dto/create-service-application.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceApplication } from './entities/service-application.entity';
import { Service } from '../service/entities/service.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class ServiceApplicationService {
  constructor(
    @InjectRepository(ServiceApplication)
    private serviceApplicationRepository: Repository<ServiceApplication>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async createServiceApplication(
    userId: ObjectId,
    fileUrl: string,
    dto: CreateServiceApplicationDto,
  ) {
    const serviceApplication = await this.serviceApplicationRepository.findOne({
      where: { userId: new ObjectId(userId) },
    });
    const existingService = await this.serviceRepository.findOne({
      where: { userId: new ObjectId(userId) },
    });
    if (serviceApplication || existingService) {
      throw new BadRequestException(
        'You are already a service provider or have a pending application',
      );
    }
    const newServiceApplication = this.serviceApplicationRepository.create(dto);
    newServiceApplication.userId = new ObjectId(userId);
    newServiceApplication.status = 'pending';
    newServiceApplication.idImage = fileUrl;
    await this.serviceApplicationRepository.save(newServiceApplication);
    return newServiceApplication;
  }
}
