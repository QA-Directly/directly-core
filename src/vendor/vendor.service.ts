import { Injectable } from '@nestjs/common';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Vendor } from './entities/vendor.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    private readonly usersService: UsersService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async applyForVendor(
    email: string,
    vendorDto: CreateVendorDto,
    idImage?: string,
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
      businessName: vendorDto.businessName,
      address: vendorDto.address,
      city: vendorDto.city,
      state: vendorDto.state,
      country: vendorDto.country,
      phoneNumber: vendorDto.phoneNumber,
      email: vendorDto.email,
      category: vendorDto.category,
      description: vendorDto.description,
      idImage: vendorDto.idImage,
      status: 'pending',
    });

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
