import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateGoogleUserDto } from './dto/create-google-user.dto';
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
    const user = await this.usersRepository.findOne({
      where: { email },
    });
    if (user) {
      return user;
    }
    return null;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { email } = createUserDto;
      const existingUser = await this.findUserByEmail(email);
      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
      const newUserDto = {
        ...createUserDto,
        provider: 'local', // Set provider to local
      };
      const newUser = this.usersRepository.create(newUserDto);
      return this.usersRepository.save(newUser);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async registerGoogleUser(dto: CreateGoogleUserDto): Promise<User> {
    const { googleId } = dto;
    const user = await this.usersRepository.findOne({
      where: { googleId },
    });
    if (!user) {
      const newUser = this.usersRepository.create(dto);
      return this.usersRepository.save(newUser);
    }
    return user;
  }

  findAll() {
    return `This action returns all users`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
