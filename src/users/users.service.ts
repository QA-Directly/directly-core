import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ObjectId } from 'mongodb';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private emailService: EmailService,
    private jwtService: JwtService,
  ) {}

  async findUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ where: { email } });
      return user || null;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      if (userData.googleId) {
        userData.provider = 'google';
        userData.isVerified = true;
      } else if (userData.facebookId) {
        userData.provider = 'facebook';
        userData.isVerified = true;
      } else {
        userData.provider = 'local';
      }
      const user = this.usersRepository.create(userData);
      if (user.provider === 'local') {
        await this.handleLocalUserVerification(user);
      }
      await this.usersRepository.save(user);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async handleLocalUserVerification(user: User): Promise<void> {
    const payload = { sub: user.id, email: user.email };
    user.verificationToken = await this.jwtService.signAsync(payload);
    user.verificationTokenExpiration = new Date(Date.now() + 30 * 60 * 1000);
    const verificationLink = `http://localhost:3000/auth/verify-email?t=${user.verificationToken}`;
    await this.emailService.sendVerificationEmail(user.email, verificationLink);
  }

  async findUserByVerificationToken(token: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { verificationToken: token },
    });
    if (!user || user.verificationTokenExpiration < new Date()) {
      return null;
    }
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiration = null;
    await this.usersRepository.save(user);
    return user || null;
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
