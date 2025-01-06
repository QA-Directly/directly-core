import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { EmailService } from 'src/email/email.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private emailService: EmailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async findUser(query: Partial<User>): Promise<User> {
    return this.usersRepository.findOne({ where: query });
  }

  async addProviderToUser(user: CreateUserDto) {
    if (user.googleId) {
      user.provider = 'google';
    } else if (user.facebookId) {
      user.provider = 'facebook';
    } else {
      user.provider = 'local';
    }
    return user;
  }
  async create(user: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.findUser({ email: user.email });
      if (existingUser) {
        throw new InternalServerErrorException('User already exists');
      }
      const data = await this.addProviderToUser(user);
      if (user.provider === 'local') {
        return this.createLocalUser(data);
      }
      return this.createOAuthUser(user);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createOAuthUser(user: CreateUserDto): Promise<User> {
    const newUser = this.usersRepository.create({ ...user, isVerified: true });
    await this.usersRepository.save(newUser);
    return newUser;
  }

  async createLocalUser(data: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create({
      ...data,
      isVerified: false,
      password: await bcrypt.hash(data.password, 10),
    });
    await this.usersRepository.save(user);
    await this.sendVerificationEmail(user);
    return user;
  }

  async sendVerificationEmail(user: User): Promise<void> {
    const payload = { sub: user.id, email: user.email };
    user.verificationToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: '30m',
    });
    user.verificationTokenExpiration = new Date(Date.now() + 30 * 60 * 1000);
    await this.usersRepository.save(user);
    const verificationLink = `https://directly-core.onrender.com/auth/verify-email?t=${user.verificationToken}`;
    await this.emailService.sendVerificationEmail(user.email, verificationLink);
  }

  async findUserByVerificationToken(token: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { verificationToken: token },
    });
    if (!user || user.verificationTokenExpiration < new Date()) {
      return null;
    }
    return user;
  }
  async verifyEmail(token: string): Promise<any> {
    const user = await this.findUserByVerificationToken(token);
    if (!user) {
      return { message: 'Invalid or expired token' };
    }
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiration = null;
    await this.usersRepository.save(user);
    return user;
  }

  async findUserByResetToken(resetToken: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { resetToken },
    });
    if (!user || user.resetTokenExpiration < new Date()) {
      return null;
    }
    return user;
  }

  async storeResetToken(
    userId: string,
    resetToken: string,
    resetTokenExpiration: Date,
  ): Promise<void> {
    await this.usersRepository.update(
      { id: userId },
      { resetToken: resetToken, resetTokenExpiration: resetTokenExpiration },
    );
  }

  async updatePassword(userId: string, newPassword: string): Promise<any> {
    await this.usersRepository.update(
      { id: userId },
      { password: newPassword, resetToken: null, resetTokenExpiration: null },
    );
    return { message: 'New password saved successfully' };
  }

  async updateUser(id: string, data: Partial<User>): Promise<any> {
    return this.usersRepository.update({ id }, data);
  }

  findAll() {
    return this.usersRepository.find();
  }

  update(id: number, updateUserDto: Partial<User>) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
