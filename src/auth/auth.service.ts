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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private async generateLoginTokens(user: SignInDto): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAccessToken: Date;
    expiresRefreshToken: Date;
  }> {
    const tokenPayload = {
      sub: user._id,
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
    return {
      accessToken,
      refreshToken,
      expiresAccessToken,
      expiresRefreshToken,
    };
  }

  private setAuthCookies(
    response: Response,
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresAccessToken: Date;
      expiresRefreshToken: Date;
    },
  ): void {
    response.cookie('Authentication', tokens.accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'none',
      expires: tokens.expiresAccessToken,
    });

    response.cookie('Refresh', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'none',
      expires: tokens.expiresRefreshToken,
    });
  }

  async validateUser({ email, password }: AuthInputDto): Promise<SignInDto> {
    try {
      const user = await this.usersService.findUserByEmail(email);
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
        _id: user._id,
        email: user.email,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async signIn(user: SignInDto, response: Response): Promise<LoginResponseDto> {
    const { _id, email } = user;
    const foundUser = await this.usersRepository.findOne({
      where: { _id },
      select: ['_id', 'email', 'role'],
    });
    const loginTokens = await this.generateLoginTokens(user);
    const {
      accessToken,
      refreshToken,
      expiresAccessToken,
      expiresRefreshToken,
    } = loginTokens;

    await this.usersService.updateUser(user._id, {
      refreshToken: await bcrypt.hash(refreshToken, 10),
      refreshTokenExpiration: expiresRefreshToken,
    });
    this.setAuthCookies(response, {
      accessToken,
      refreshToken,
      expiresAccessToken,
      expiresRefreshToken,
    });

    return {
      _id: foundUser._id,
      email: foundUser.email,
      role: foundUser.role,
    };
  }

  async verifyRefreshToken(refreshToken: string, email: string): Promise<User> {
    try {
      const user = await this.usersService.findUserByEmail(email);
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

  async resendVerificationEmail(email: string): Promise<any> {
    const foundUser = await this.usersService.findUserByEmail(email);
    if (!foundUser) {
      throw new UnauthorizedException('No user found for email: ' + email);
    }
    if (foundUser.isVerified) {
      throw new UnauthorizedException('Email already verified');
    }
    return this.usersService.sendVerificationEmail(foundUser);
  }

  async forgotPassword(email: string): Promise<void> {
    const foundUser = await this.usersService.findUserByEmail(email);
    if (!foundUser) {
      throw new UnauthorizedException('No user found for email: ' + email);
    }
    return this.sendPasswordResetLInk(email, foundUser);
  }

  async sendPasswordResetLInk(email: string, user: User): Promise<any> {
    const payload = { email, sub: user._id };
    const token = await this.jwtService.signAsync(payload);
    const resetTokenExpiration = new Date();
    resetTokenExpiration.setHours(resetTokenExpiration.getHours() + 1);

    await this.usersService.storeResetToken(
      user._id,
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
    await this.usersService.updatePassword(user._id, hashedPassword);
    await this.emailService.sendResetPasswordConfirmationEmail(user.email);
    return { message: 'Password reset successfully' };
  }

  async validateGoogleUser(profile: GoogleData): Promise<User> {
    const user = await this.usersService.findUserByEmail(profile.email);
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
    const loginTokens = await this.generateLoginTokens(user);
    const {
      accessToken,
      refreshToken,
      expiresAccessToken,
      expiresRefreshToken,
    } = loginTokens;
    await this.usersService.updateUser(user._id, {
      refreshToken: await bcrypt.hash(refreshToken, 10),
      refreshTokenExpiration: expiresRefreshToken,
    });
    this.setAuthCookies(response, {
      accessToken,
      refreshToken,
      expiresAccessToken,
      expiresRefreshToken,
    });
    response.redirect('https://directly-app.netlify.app/dashboard');
    return {
      _id: user._id,
      email: user.email,
      role: user.role,
    };
  }

  async validateFacebookUser(profile: FacebookData): Promise<any> {
    const user = await this.usersService.findUserByEmail(profile.email);
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

  async facebookSignIn(
    user: User,
    response: Response,
  ): Promise<LoginResponseDto> {
    const loginTokens = await this.generateLoginTokens(user);
    const {
      accessToken,
      refreshToken,
      expiresAccessToken,
      expiresRefreshToken,
    } = loginTokens;
    await this.usersService.updateUser(user._id, {
      refreshToken: await bcrypt.hash(refreshToken, 10),
      refreshTokenExpiration: expiresRefreshToken,
    });
    this.setAuthCookies(response, {
      accessToken,
      refreshToken,
      expiresAccessToken,
      expiresRefreshToken,
    });
    response.redirect('https://directly-app.netlify.app/dashboard');
    return {
      _id: user._id,
      email: user.email,
      role: user.role,
    };
  }
  async logout(response: Response): Promise<void> {
    response.clearCookie('Refresh', {
      httpOnly: true,
      sameSite: 'none',
      secure: this.configService.get('NODE_ENV') === 'production',
    });
    response.clearCookie('Authentication', {
      httpOnly: true,
      sameSite: 'none',
      secure: this.configService.get('NODE_ENV') === 'production',
    });
    return;
  }
  async getProfile(email: string): Promise<User> {
    return this.usersService.findUserByEmail(email);
  }
}
