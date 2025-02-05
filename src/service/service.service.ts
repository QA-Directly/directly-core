import { Injectable } from '@nestjs/common';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Vendor } from './entities/service.entity';
import { In, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly usersService: UsersService,
  ) {}

  async createVendor(
    email: string,
    vendorDto: CreateVendorDto,
  ): Promise<Vendor> {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const existingVendor = await this.vendorRepository.findOne({
      where: { user: { email } },
    });
    if (existingVendor)
      throw new BadRequestException(
        'You are already a vendor or have a pending application',
      );

    const vendor = this.vendorRepository.create({
      user,
      ...vendorDto,
    });

    await this.vendorRepository.save(vendor);
    return vendor;
  }

  async approveVendor(userId: string): Promise<Vendor> {
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

  async rejectVendor(userId: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!vendor) throw new NotFoundException('Vendor application not found');

    vendor.status = 'rejected';
    return this.vendorRepository.save(vendor);
  }

  create(createVendorDto: CreateVendorDto) {
    return 'This action adds a new vendor';
  }

  findAll() {
    return `This action returns all vendor`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vendor`;
  }

  update(id: number, updateVendorDto: UpdateVendorDto) {
    return `This action updates a #${id} vendor`;
  }

  remove(id: number) {
    return `This action removes a #${id} vendor`;
  }
}
