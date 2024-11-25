import { Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportLocalGuard } from './guards/passport-local.guards';
import { PassportJwtGuard } from './guards/passport-jwt.guards';
import { PassportGoogleGuard } from './guards/passport-google.guards';
import { PassportFacebookGuard } from './guards/passport-facebook.guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(PassportLocalGuard)
  async login(@Request() req) {
    return this.authService.signIn(req.user);
  }

  @Get('google')
  @UseGuards(PassportGoogleGuard)
  async googleLogin() {}

  @Get('google/callback')
  @UseGuards(PassportGoogleGuard)
  async googleCallback(@Request() req) {
    return this.authService.googleSignIn(req.user);
  }

  @Get('facebook')
  @UseGuards(PassportFacebookGuard)
  async facebookLogin() {}

  @Get('facebook/callback')
  @UseGuards(PassportFacebookGuard)
  async facebookCallback(@Request() req) {
    return this.authService.facebookSignIn(req.user);
  }

  @Get('profile')
  @UseGuards(PassportJwtGuard)
  getProfile(@Request() req) {
    return req.user;
  }
}
