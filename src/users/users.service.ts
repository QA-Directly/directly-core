import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { EmailService } from 'src/email/email.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user';
import * as bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private emailService: EmailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async create(user: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.usersRepository.findOne({
        where: { email: user.email },
      });
      if (existingUser) {
        throw new InternalServerErrorException('User already exists');
      }
      user.role = 'user';

      const data = await this.addProviderToUser(user);

      return user.provider === 'local'
        ? this.createLocalUser(data)
        : this.createOAuthUser(data);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user;
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

  async sendVerificationEmail(user: User): Promise<{ message: string }> {
    const payload = { sub: user._id, email: user.email };
    user.verificationToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: '30m',
    });
    user.verificationTokenExpiration = new Date(Date.now() + 30 * 60 * 1000);
    await this.usersRepository.save(user);
    const verificationLink = `https://directly-core.onrender.com/auth/verify-email?t=${user.verificationToken}`;
    await this.emailService.sendVerificationEmail(user.email, verificationLink);
    return { message: `Verification email sent to ${user.email}` };
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
    userId: ObjectId,
    resetToken: string,
    resetTokenExpiration: Date,
  ): Promise<void> {
    await this.usersRepository.update(
      { _id: userId },
      { resetToken: resetToken, resetTokenExpiration: resetTokenExpiration },
    );
  }

  async updatePassword(userId: ObjectId, newPassword: string): Promise<any> {
    await this.usersRepository.update(
      { _id: userId },
      { password: newPassword, resetToken: null, resetTokenExpiration: null },
    );
    return { message: 'New password saved successfully' };
  }

  async updateUser(_id: ObjectId, data: Partial<User>): Promise<any> {
    return this.usersRepository.update({ _id }, data);
  }

  async addProfilePicture(userId: ObjectId, fileUrl: string) {
    const user = await this.usersRepository.findOne({
      where: { _id: new ObjectId(userId) },
    });
    if (!user) throw new Error('User not found');

    user.profilePicture = fileUrl;
    return this.usersRepository.save(user);
  }

  async updateProfilePicture(userId: ObjectId, newFileUrl: string) {
    const user = await this.usersRepository.findOne({
      where: { _id: new ObjectId(userId) },
    });
    if (!user) throw new NotFoundException('User not found');

    user.profilePicture = newFileUrl;
    return this.usersRepository.save(user);
  }

  async deleteProfilePicture(userId: ObjectId) {
    const user = await this.usersRepository.findOne({
      where: { _id: new ObjectId(userId) },
    });
    if (!user) throw new NotFoundException('User not found');

    user.profilePicture = null;
    return this.usersRepository.save(user);
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
