import { Injectable } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Service } from 'src/service/entities/service.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async approveVendor(serviceId: ObjectId): Promise<Service> {
    console.log(serviceId);
    const serviceProvider = await this.serviceRepository.findOne({
      where: { _id: new ObjectId(serviceId) },
    });
    if (!serviceProvider) {
      throw new NotFoundException('Vendor application not found');
    }
    if (serviceProvider.status !== 'pending') {
      throw new BadRequestException(
        'No pending application found for this user',
      );
    }
    await this.userRepository.update(
      { _id: new ObjectId(serviceId) },
      { role: 'service-provider' },
    );
    serviceProvider.status = 'approved';
    return await this.serviceRepository.save(serviceProvider);
  }

  async rejectVendor(serviceId: ObjectId): Promise<Service> {
    const serviceProvider = await this.serviceRepository.findOne({
      where: { _id: new ObjectId(serviceId) },
    });
    if (!serviceProvider) {
      throw new NotFoundException('Vendor application not found');
    }
    if (serviceProvider.status !== 'pending') {
      throw new BadRequestException(
        'No pending application found for this user',
      );
    }
    await this.userRepository.update(
      { _id: new ObjectId(serviceId) },
      { role: 'regular', serviceId: null },
    );
    serviceProvider.status = 'rejected';
    return this.serviceRepository.save(serviceProvider);
  }
}
