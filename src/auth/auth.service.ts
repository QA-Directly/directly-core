import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { EmailService } from 'src/email/email.service';

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
  async forgotPassword(email: string): Promise<void> {
    const foundUser = await this.usersService.findUserByEmail(email);
    if (!foundUser) {
      throw new UnauthorizedException('No user found for email: ' + email);
    }
    return this.sendPasswordResetLInk(email, foundUser);
  }
  async sendPasswordResetLInk(email: string, user: User): Promise<any> {
    const payload = { email };
    const token = await this.jwtService.signAsync(payload);
    const resetTokenExpiration = new Date();
    resetTokenExpiration.setHours(resetTokenExpiration.getHours() + 1);

    await this.usersService.storeResetToken(
      user.id,
      token,
      resetTokenExpiration,
    );
    const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;
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

  async authenticateGoogle(profile: GoogleData): Promise<AuthResponse> {
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

  async googleSignIn(user: User): Promise<AuthResponse> {
    const userId = user.id;
    const tokenPayload = {
      sub: user.id.toHexString(),
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);
    return {
      userId: userId.toHexString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      accessToken,
    };
  }
  async authenticateFacebook(profile: FacebookData): Promise<AuthResponse> {
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
  async facebookSignIn(user: User): Promise<AuthResponse> {
    const tokenPayload = {
      sub: user.id.toHexString(),
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);
    return {
      userId: user.id.toHexString(),
      facebookId: user.facebookId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      accessToken,
    };
  }
}
