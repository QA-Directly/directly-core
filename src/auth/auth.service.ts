import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

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
    if (user && user.provider !== 'google' && user.provider !== 'facebook') {
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

  async authenticateGoogle(profile: GoogleData): Promise<AuthResponse> {
    const user = await this.validateGoogleUser(profile);
    return this.googleSignIn(user);
  }

  async validateGoogleUser(profile: GoogleData): Promise<User> {
    const user = await this.usersService.findUserByEmail(profile.email);
    if (user) {
      return user;
    }
    const newUser = await this.usersService.createUser({
      googleId: profile.googleId,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: profile.avatar,
      provider: profile.provider,
      facebookId: null,
    });
    return newUser;
  }

  async googleSignIn(user: User): Promise<AuthResponse> {
    const tokenPayload = {
      sub: user.googleId,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);
    return {
      googleId: user.googleId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      accessToken,
    };
  }
  async authenticateFacebook(profile: FacebookData): Promise<AuthResponse> {
    const user = await this.validateFacebookUser(profile);
    return this.googleSignIn(user);
  }
  async validateFacebookUser(profile: FacebookData): Promise<any> {
    const user = await this.usersService.findUserByEmail(profile.email);
    if (user) {
      return user;
    }
    const newUser = await this.usersService.createUser({
      facebookId: profile.facebookId,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      provider: profile.provider,
    });
    return newUser;
  }
  async facebookSignIn(user: User): Promise<AuthResponse> {
    const tokenPayload = {
      sub: user.facebookId,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);
    return {
      facebookId: user.facebookId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      accessToken,
    };
  }
}
