import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SigninUserDto } from 'src/users/dto/signin-user.dto';
import { UsersService } from 'src/users/users.service';
import { ObjectId } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

type UserResponse = { userId: ObjectId; email: string };
type AuthResponse = { userId: ObjectId; accessToken: string; email: string };

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async comparePassword(
    inputPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(inputPassword, hashedPassword);
  }

  async authenticate(input: SigninUserDto): Promise<AuthResponse> {
    const user = await this.validateUser(input);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.signIn(user);
  }

  async validateUser(input: SigninUserDto): Promise<UserResponse> {
    const user = await this.usersService.findUserByEmail(input.email);
    if (user && (await this.comparePassword(input.password, user.password))) {
      return { userId: user._id, email: user.email };
    }
    return null;
  }
  async signIn(user: UserResponse): Promise<AuthResponse> {
    const tokenPayload = {
      sub: user.userId,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);
    return { userId: user.userId, accessToken, email: user.email };
  }
}
