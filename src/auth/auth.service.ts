import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
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

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async comparePassword(
    inputPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(inputPassword, hashedPassword);
  }

  async authenticate(input: AuthInputDto): Promise<LoginResponseDto> {
    const user = await this.validateUser(input);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.signIn(user);
  }

  async validateUser(input: AuthInputDto): Promise<SignInDto> {
    try {
      const user = await this.usersService.findUserByEmail(input.email);
      if (!user) {
        return null;
      }
      if (!user.isVerified) {
        throw new UnauthorizedException(
          'Email not verified. Please verify email',
        );
      }
      const isPasswordValid = await this.comparePassword(
        input.password,
        user.password,
      );
      if (!isPasswordValid) {
        return null;
      }
      return {
        userId: user.id,
        email: user.email,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async signIn(user: SignInDto): Promise<LoginResponseDto> {
    const tokenPayload = {
      sub: user.userId,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);
    return {
      id: user.userId,
      accessToken,
      email: user.email,
    };
  }

  async verifyEmailToken(token: string): Promise<any> {
    if (!token) {
      throw new BadRequestException('Invalid or missing token');
    }
    const user = await this.usersService.findUserByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }
    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email: string): Promise<void> {
    const foundUser = await this.usersService.findUserByEmail(email);
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
    const resetLink = `http://localhost:3000/auth/reset-password?t=${token}`;
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

  async authenticateGoogle(profile: GoogleData): Promise<LoginResponseDto> {
    const user = await this.validateGoogleUser(profile);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return await this.googleSignIn(user);
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

  async googleSignIn(user: User): Promise<LoginResponseDto> {
    const tokenPayload = {
      sub: user.id,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);
    return {
      id: user.id,
      email: user.email,
      accessToken,
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
      googleId: null,
    });
    return newUser;
  }
  async facebookSignIn(user: User): Promise<LoginResponseDto> {
    const tokenPayload = {
      sub: user.id,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);
    return {
      id: user.id,
      email: user.email,
      accessToken,
    };
  }
  async getProfile(email: string): Promise<User> {
    return this.usersService.findUserByEmail(email);
  }
}
