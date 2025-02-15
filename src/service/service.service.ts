import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ObjectId } from 'mongodb';
import { In } from 'typeorm';
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
      profilePicture: user.profilePicture,
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

  async findAll() {
    const services = await this.serviceRepository.find();
    const userIds = services.map((service) => service.userId.toString());

    const users = await this.userRepository.find({
      where: { _id: In(userIds) },
    });

    const userMap = new Map(
      users.map((user) => [user._id.toString(), user.profilePicture]),
    );

    return services.map((service) => ({
      ...service,
      profilePicture: userMap.get(service.userId.toString()) || null,
    }));
  }

  findOne(id: number) {
    return `This action returns a #${id} vendor`;
  }

  async updateMediaInService(
    serviceId: ObjectId,
    oldFileUrl: string,
    newFileUrl: string,
  ) {
    const service = await this.serviceRepository.findOne({
      where: { _id: new ObjectId(serviceId) },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const mediaIndex = service.mediaFiles?.indexOf(oldFileUrl);
    if (mediaIndex === -1 || mediaIndex === undefined) {
      throw new NotFoundException('Old media file not found');
    }

    service.mediaFiles[mediaIndex] = newFileUrl;

    return await this.serviceRepository.save(service);
  }

  async deleteMediaFromService(serviceId: ObjectId, fileUrl: string) {
    const service = await this.serviceRepository.findOne({
      where: { _id: new ObjectId(serviceId) },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const filteredMedia = service.mediaFiles?.filter((url) => url !== fileUrl);
    if (filteredMedia?.length === service.mediaFiles?.length) {
      throw new NotFoundException('Media file not found');
    }

    service.mediaFiles = filteredMedia;

    return await this.serviceRepository.save(service);
  }
}
