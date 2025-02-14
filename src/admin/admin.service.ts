import { Injectable } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Service } from 'src/service/entities/service.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { ServiceApplication } from 'src/service-application/entities/service-application.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ServiceApplication)
    private serviceApplicationRepository: Repository<ServiceApplication>,
  ) {}

  async approveService(userId: ObjectId): Promise<Service> {
    const serviceApplication = await this.serviceApplicationRepository.findOne({
      where: { userId: new ObjectId(userId) },
    });
    if (!serviceApplication) {
      throw new NotFoundException('Service application not found');
    }
    if (serviceApplication.status !== 'pending') {
      throw new BadRequestException(
        'No pending application found for this user',
      );
    }

    const newService = this.serviceRepository.create({
      userId: new ObjectId(userId),
      businessName: serviceApplication.businessName,
      address: serviceApplication.address,
      city: serviceApplication.city,
      state: serviceApplication.state,
      country: serviceApplication.country,
      phoneNumber: serviceApplication.phoneNumber,
      email: serviceApplication.email,
      category: serviceApplication.category,
      description: serviceApplication.description,
      idImage: serviceApplication.idImage,
      status: 'approved',
    });
    await this.serviceRepository.save(newService);

    await this.userRepository.update(
      { _id: new ObjectId(userId) },
      { role: 'service-provider', serviceId: newService._id },
    );

    await this.serviceApplicationRepository.delete({
      userId: new ObjectId(userId),
    });
    return newService;
  }

  async rejectVendor(userId: ObjectId): Promise<ServiceApplication> {
    const serviceApplication = await this.serviceApplicationRepository.findOne({
      where: { userId: new ObjectId(userId) },
    });
    if (!serviceApplication) {
      throw new NotFoundException('Service application not found');
    }
    if (serviceApplication.status !== 'pending') {
      throw new BadRequestException(
        'No pending application found for this user',
      );
    }
    await this.serviceApplicationRepository.update(
      { userId: new ObjectId(userId) },
      { status: 'rejected' },
    );

    return await this.serviceApplicationRepository.findOne({
      where: { userId: new ObjectId(userId) },
    });
  }
}
