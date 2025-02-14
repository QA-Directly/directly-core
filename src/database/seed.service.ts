import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  async seedAdminUser() {
    const adminExists = await this.usersRepository.findOne({
      where: { role: 'admin' },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(
        this.configService.getOrThrow<string>('ADMIN_PASSWORD'),
        10,
      );
      const adminUser = this.usersRepository.create({
        email: this.configService.getOrThrow<string>('ADMIN_EMAIL'),
        password: hashedPassword,
        role: 'admin',
        provider: 'local',
        isVerified: true,
      });

      await this.usersRepository.save(adminUser);
      console.log('Admin user created.');
    }
  }
}
