import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ where: { email } });
      return user || null;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createUser(userData: Partial<User>): Promise<User> {
    try {
      if (userData.googleId) {
        userData.provider = 'google';
      } else if (userData.facebookId) {
        userData.provider = 'facebook';
      } else {
        userData.provider = 'local';
      }
      const user = this.usersRepository.create(userData);
      return this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  update(id: number, updateUserDto: Partial<User>) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
