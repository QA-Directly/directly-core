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
import { PassportLocalGuard } from './guards/passport-local.guards';
import { PassportJwtGuard } from './guards/passport-jwt.guards';
import { PassportGoogleGuard } from './guards/passport-google.guards';
import { PassportFacebookGuard } from './guards/passport-facebook.guards';
import { VerifyEmailDto } from 'src/users/dto/verify-email.dto';
import { ForgotPasswordDto } from 'src/users/dto/forgot-password.dto';
import { ResetPasswordQueryDto } from 'src/users/dto/reset-password-query.dto';
import { ResetPasswordBodyDto } from 'src/users/dto/reser-password-body.dto';
import { LoginResponseDto } from 'src/users/dto/login-response.dto';
import { AuthRequest, SocialRequest } from './auth.types';
import { SignInDto } from 'src/users/dto/signin-request.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiBearerAuth()
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
  @UseGuards(PassportLocalGuard)
  async login(@Request() req: AuthRequest): Promise<LoginResponseDto> {
    const user = await this.authService.signIn(req.user);
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
  async verifyEmail(@Query('t') query: VerifyEmailDto): Promise<void> {
    const { token } = query;
    return this.authService.verifyEmailToken(token);
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
  @UseGuards(PassportGoogleGuard)
  async googleCallback(@Request() req: SocialRequest) {
    return this.authService.googleSignIn(req.user);
  }

  @Get('facebook')
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
  async facebookCallback(@Request() req: SocialRequest) {
    return this.authService.facebookSignIn(req.user);
  }

  @Get('profile')
  @UseGuards(PassportJwtGuard)
  async getProfile(@Request() req: AuthRequest) {
    const email = req.user.email;
    const userProfile = await this.authService.getProfile(email);
    return userProfile;
  }
}
