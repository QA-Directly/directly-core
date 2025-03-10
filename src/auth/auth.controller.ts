import {
  Controller,
  Post,
  UseGuards,
  Get,
  Body,
  Query,
  HttpCode,
  Request,
  HttpStatus,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiResponse,
  ApiQuery,
  ApiOperation,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { PassportLocalGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { PassportGoogleGuard } from './guards/passport-google.guard';
import { PassportFacebookGuard } from './guards/passport-facebook.guard';
import { Response } from 'express';
import { VerifyEmailDto } from 'src/users/dto/verify-email.dto';
import { ForgotPasswordDto } from 'src/users/dto/forgot-password.dto';
import { ResetPasswordQueryDto } from 'src/users/dto/reset-password-query.dto';
import { ResetPasswordBodyDto } from 'src/users/dto/reset-password-body.dto';
import { LoginResponseDto } from 'src/users/dto/login-response.dto';
import { AuthRequest } from './auth.types';
import { SignInDto } from 'src/users/dto/signin-request.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh.guard';
import { User } from 'src/users/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(PassportLocalGuard)
  @ApiOperation({
    summary: 'Login user',
    description: 'Logs in a user with the provided credentials',
  })
  @ApiBody({
    description: 'User information extracted from the request',
    type: SignInDto,
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(
    @CurrentUser() user: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.signIn(user, response);
    return user;
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  @ApiOperation({
    summary: 'Refresh user token',
    description: 'Refreshes the user token using the refresh token.',
  })
  async refreshToken(
    @CurrentUser() user: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.signIn(user, response);
    return user;
  }

  @Get('verify-email')
  @ApiOperation({
    summary: 'Verify user email by token',
    description:
      'Verifies a user email using the provided token from the query parameter.',
  })
  @ApiQuery({
    name: 't',
    type: String,
    description: 'The token sent to the user for email verification',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Email successfully verified' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(
    @Query() query: VerifyEmailDto,
    @Res() res: Response,
  ): Promise<void> {
    const { t } = query;
    await this.authService.verifyEmailToken(t);
    return res.redirect('https://directly-app.netlify.app/auth/verify-email');
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiBody({
    description: 'Email of the user who needs verification',
    required: true,
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email resent successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resendVerification(
    @Body() { email }: { email: string },
  ): Promise<void> {
    return this.authService.resendVerificationEmail(email);
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Request a password reset',
    description: 'Sends a password reset email to the provided email address.',
  })
  @ApiBody({
    description: 'Email address of the user requesting password reset',
    type: ForgotPasswordDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset link sent to the provided email address.',
  })
  @ApiResponse({ status: 400, description: 'Invalid email format' })
  @ApiResponse({ status: 404, description: 'Email not found' })
  async forgotPassword(@Body() body: ForgotPasswordDto): Promise<void> {
    const { email } = body;
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset user password using a token',
    description:
      'Resets the user password using the provided token and new password.',
  })
  @ApiQuery({
    name: 't',
    type: ResetPasswordQueryDto,
    description: 'The token for resetting the password',
    required: true,
  })
  @ApiBody({
    description: 'New password to set for the user',
    type: ResetPasswordBodyDto,
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token or new password' })
  @ApiResponse({ status: 404, description: 'Token not found or expired' })
  async resetPassword(
    @Query('t') query: ResetPasswordQueryDto,
    @Body() body: ResetPasswordBodyDto,
  ): Promise<void> {
    const { token } = query;
    const { newPassword } = body;
    return this.authService.resetPassword(token, newPassword);
  }

  @Get('google')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Initiate Google OAuth2 login',
    description:
      'Redirects the user to the Google authentication page to initiate the OAuth2 login flow.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to Google authentication page.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized if authentication fails.',
  })
  @UseGuards(PassportGoogleGuard)
  async googleLogin() {}

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(PassportGoogleGuard)
  @Get('google/callback')
  @ApiOperation({
    summary: 'Handle Google OAuth2 callback',
    description: 'Processes the callback from Google after a successful login.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated and returns user info and token.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description:
      'Unauthorized if the callback request is invalid or the user is not authenticated.',
  })
  async googleCallback(
    @CurrentUser() user: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.googleSignIn(user, response);
  }

  @Get('facebook')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Initiates Facebook OAuth2 login',
    description:
      'Redirects the user to the Facebook authentication page to initiate the OAuth2 login flow.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to Facebook authentication page.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized if authentication fails.',
  })
  @UseGuards(PassportFacebookGuard)
  async facebookLogin() {}

  @HttpCode(HttpStatus.OK)
  @Get('facebook/callback')
  @ApiOperation({
    summary: 'Handle Facebook OAuth2 callback',
    description:
      'Processes the callback from Facebook after a successful login.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated and returns user info and token.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description:
      'Unauthorized if the callback request is invalid or the user is not authenticated.',
  })
  @UseGuards(PassportFacebookGuard)
  async facebookCallback(
    @CurrentUser() user: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.facebookSignIn(user, response);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Logout user',
    description: 'Logs out the user by clearing the authentication cookies.',
  })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) response: Response) {
    await this.authService.logout(response);
    return { message: 'User successfully logged out' };
  }

  @Get('profile')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Returns the profile of the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile successfully retrieved',
    type: User,
  })
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: AuthRequest) {
    const email = req.user.email;
    const userProfile = await this.authService.getProfile(email);
    return userProfile;
  }
}
