import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private vendorRepository: Repository<Service>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly usersService: UsersService,
  ) {}

  async createService(
    email: string,
    serviceDto: CreateServiceDto,
  ): Promise<Service> {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const existingService = await this.vendorRepository.findOne({
      where: { user: { email } },
    });
    if (existingService)
      throw new BadRequestException(
        'You are already a vendor or have a pending application',
      );

    const createdService = this.vendorRepository.create({
      user,
      ...serviceDto,
    });

    const service = await this.vendorRepository.save(createdService);
    return service;
  }

  async approveVendor(userId: string): Promise<Service> {
    const vendor = await this.vendorRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!vendor) throw new NotFoundException('Vendor application not found');

    vendor.status = 'approved';
    vendor.user.role = 'vendor';
    await this.userRepository.save(vendor.user);

    return this.vendorRepository.save(vendor);
  }

  async rejectVendor(userId: string): Promise<Service> {
    const vendor = await this.vendorRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!vendor) throw new NotFoundException('Vendor application not found');

    vendor.status = 'rejected';
    return this.vendorRepository.save(vendor);
  }

  create(createVendorDto: CreateServiceDto) {
    return 'This action adds a new vendor';
  }

  findAll() {
    return `This action returns all vendor`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vendor`;
  }

  update(id: number, updateVendorDto: UpdateServiceDto) {
    return `This action updates a #${id} vendor`;
  }

  remove(id: number) {
    return `This action removes a #${id} vendor`;
  }
}
