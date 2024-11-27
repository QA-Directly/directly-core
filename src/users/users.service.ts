import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ObjectId } from 'mongodb';

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

  async findUserByResetToken(resetToken: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { resetToken },
    });
    return user || null;
  }

  async storeResetToken(
    userId: ObjectId,
    resetToken: string,
    resetTokenExpiration: Date,
  ): Promise<void> {
    await this.usersRepository.update(
      { id: userId },
      { resetToken: resetToken, resetTokenExpiration: resetTokenExpiration },
    );
  }
  async updatePassword(userId: ObjectId, newPassword: string): Promise<any> {
    await this.usersRepository.update(
      { id: userId },
      { password: newPassword, resetToken: null, resetTokenExpiration: null },
    );
    return { message: 'New password saved successfully' };
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
