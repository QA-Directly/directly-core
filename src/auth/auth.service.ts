import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { GoogleData, FacebookData } from './auth.types';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { EmailService } from 'src/email/email.service';
import { LoginResponseDto } from 'src/users/dto/login-response.dto';
import { SignInDto } from 'src/users/dto/signin-request.dto';
import { AuthInputDto } from 'src/users/dto/auth-input.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async validateUser({ email, password }: AuthInputDto): Promise<SignInDto> {
    try {
      const user = await this.usersService.findUser({ email: email });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (!user.isVerified) {
        throw new UnauthorizedException(
          'Email not verified. Please verify email',
        );
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Password is incorrect');
      }
      return {
        userId: user.id,
        email: user.email,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async signIn(user: SignInDto, response: Response): Promise<LoginResponseDto> {
    const expiresAccessToken = new Date();
    expiresAccessToken.setMinutes(
      expiresAccessToken.getMinutes() +
        parseInt(
          this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN'),
        ),
    );
    const expiresRefreshToken = new Date();
    expiresRefreshToken.setMinutes(
      expiresRefreshToken.getMinutes() +
        parseInt(
          this.configService.getOrThrow<string>('REFRESH_TOKEN_EXPIRES_IN'),
        ),
    );
    const tokenPayload = {
      sub: user.userId,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: `${this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN')}m`,
    });
    const refreshToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow<string>('REFRESH_TOKEN_EXPIRES_IN')}m`,
    });
    await this.usersService.updateUser(user.userId, {
      refreshToken: await bcrypt.hash(refreshToken, 10),
      refreshTokenExpiration: expiresRefreshToken,
    });
    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresAccessToken,
    });
    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresRefreshToken,
    });

    return {
      id: user.userId,
      email: user.email,
    };
  }
  async verifyRefreshToken(refreshToken: string, userId: string) {
    try {
      const user = await this.usersService.findUser({ id: userId });
      const authenticated = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyEmailToken(token: string): Promise<any> {
    if (!token) {
      throw new BadRequestException('Invalid or missing token');
    }
    const user = await this.usersService.verifyEmail(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }
    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email: string): Promise<void> {
    const foundUser = await this.usersService.findUser({ email: email });
    if (!foundUser) {
      throw new UnauthorizedException('No user found for email: ' + email);
    }
    return this.sendPasswordResetLInk(email, foundUser);
  }

  async sendPasswordResetLInk(email: string, user: User): Promise<any> {
    const payload = { email, sub: user.id };
    const token = await this.jwtService.signAsync(payload);
    const resetTokenExpiration = new Date();
    resetTokenExpiration.setHours(resetTokenExpiration.getHours() + 1);

    await this.usersService.storeResetToken(
      user.id,
      token,
      resetTokenExpiration,
    );
    const resetLink = `https://directly-core.onrender.com/auth/reset-password?t=${token}`;
    await this.emailService.sendPasswordResetEmail(email, resetLink);

    return { message: `Password reset link sent to ${email}` };
  }

  async resetPassword(token: string, newPassword: string): Promise<any> {
    const user = await this.usersService.findUserByResetToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    const now = new Date();
    if (now > user.resetTokenExpiration) {
      throw new UnauthorizedException('Token expired');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user.id, hashedPassword);
    await this.emailService.sendResetPasswordConfirmationEmail(user.email);
    return { message: 'Password reset successfully' };
  }

  async validateGoogleUser(profile: GoogleData): Promise<User> {
    const user = await this.usersService.findUser({ email: profile.email });
    if (user) {
      return user;
    }
    const newUser = await this.usersService.create({
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

  async googleSignIn(
    user: User,
    response: Response,
  ): Promise<LoginResponseDto> {
    const tokenPayload = {
      sub: user.id,
      email: user.email,
    };
    const expiresAccessToken = new Date();
    expiresAccessToken.setMinutes(
      expiresAccessToken.getMinutes() +
        parseInt(
          this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN'),
        ),
    );
    const expiresRefreshToken = new Date();
    expiresRefreshToken.setMinutes(
      expiresRefreshToken.getMinutes() +
        parseInt(
          this.configService.getOrThrow<string>('REFRESH_TOKEN_EXPIRES_IN'),
        ),
    );
    const accessToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: `${this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN')}m`,
    });
    const refreshToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow<string>('REFRESH_TOKEN_EXPIRES_IN')}m`,
    });
    await this.usersService.updateUser(user.id, {
      refreshToken: await bcrypt.hash(refreshToken, 10),
      refreshTokenExpiration: expiresRefreshToken,
    });
    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresAccessToken,
    });
    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresRefreshToken,
    });
    return {
      id: user.id,
      email: user.email,
    };
  }
  async authenticateFacebook(profile: FacebookData): Promise<LoginResponseDto> {
    const user = await this.validateFacebookUser(profile);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return await this.googleSignIn(user);
  }
  async validateFacebookUser(profile: FacebookData): Promise<any> {
    const user = await this.usersService.findUser({ email: profile.email });
    if (user) {
      return user;
    }
    const newUser = await this.usersService.create({
      facebookId: profile.facebookId,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      provider: profile.provider,
      googleId: null,
    });
    return newUser;
  }
  async facebookSignIn(user: User): Promise<LoginResponseDto> {
    const tokenPayload = {
      sub: user.id,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: `${this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN')}m`,
    });
    return {
      id: user.id,
      email: user.email,
      accessToken,
    };
  }
  async getProfile(id: string): Promise<User> {
    return this.usersService.findUser({ id });
  }
}
