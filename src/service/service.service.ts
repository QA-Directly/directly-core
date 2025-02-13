import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ObjectId } from 'mongodb';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createService(
    email: string,
    serviceDto: CreateServiceDto,
  ): Promise<Service> {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.serviceId) {
      throw new BadRequestException(
        'You are already a vendor or have a pending application',
      );
    }

    const createdService = this.serviceRepository.create({
      userId: user._id,
      status: 'pending',
      ...serviceDto,
    });
    const service = await this.serviceRepository.save(createdService);
    await this.userRepository.update(
      { _id: user._id },
      { serviceId: createdService._id },
    );
    return service;
  }

  async approveVendor(userId: string): Promise<Service> {
    const serviceProvider = await this.serviceRepository.findOne({
      where: { userId: new ObjectId(userId) },
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
      { _id: new ObjectId(userId) },
      { role: 'service-provider' },
    );
    serviceProvider.status = 'approved';
    return await this.serviceRepository.save(serviceProvider);
  }

  async rejectVendor(userId: ObjectId): Promise<Service> {
    const serviceProvider = await this.serviceRepository.findOne({
      where: { userId: new ObjectId(userId) },
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
      { _id: new ObjectId(userId) },
      { role: 'regular', serviceId: null },
    );
    serviceProvider.status = 'rejected';
    return this.serviceRepository.save(serviceProvider);
  }

  async addMediaToService(serviceId: ObjectId, fileUrls: string[]) {
    const service = await this.serviceRepository.findOne({
      where: { _id: new ObjectId(serviceId) },
    });

    if (!service) {
      throw new Error('Service not found');
    }

    service.mediaFiles = [...(service.mediaFiles || []), ...fileUrls];

    return await this.serviceRepository.save(service);
  }

  findAll() {
    const services = this.serviceRepository.find();
    return services;
  }

  findOne(id: number) {
    return `This action returns a #${id} vendor`;
  }

  update(id: string, updateVendorDto: UpdateServiceDto) {
    return `This action updates a #${id} vendor`;
  }

  remove(id: number) {
    return `This action removes a #${id} vendor`;
  }
}
