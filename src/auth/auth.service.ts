import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

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

  async authenticate(input: AuthInput): Promise<AuthResponse> {
    const user = await this.validateUser(input);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.signIn(user);
  }

  async validateUser(input: AuthInput): Promise<SignInData> {
    const user = await this.usersService.findUserByEmail(input.email);
    if (!user) {
      return null;
    }
    if (user && user.provider !== 'google') {
      const isPasswordValid = await this.comparePassword(
        input.password,
        user.password,
      );
      if (!isPasswordValid) {
        return null;
      }
      return {
        userId: user.id.toHexString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    }
  }
  async signIn(user: SignInData): Promise<AuthResponse> {
    const tokenPayload = {
      sub: user.userId,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);
    return {
      userId: user.userId,
      accessToken,
      email: user.email,
    };
  }

  async auhtenticateGoogle(profile: GoogleData): Promise<AuthResponse> {
    const user = await this.validateGoogleUser(profile);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.googleSignIn(user);
  }

  async validateGoogleUser(profile: GoogleData): Promise<any> {
    const user = await this.usersService.registerGoogleUser(profile);
    if (user) {
      return user;
    }
    return null;
  }

  async googleSignIn(profile: GoogleData): Promise<AuthResponse> {
    const tokenPayload = {
      sub: profile.googleId,
      email: profile.email,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);
    return {
      userId: profile.googleId,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: profile.avatar,
      accessToken,
    };
  }
}
