import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URI,
      scope: ['email', 'profile'],
      passReqtoCallback: true,
    });
  }

  async validate(accessToken: string, profile: any, req: any): Promise<any> {
    try {
      const { provider, id, emails, name, photos } = req;
      const userProfile = {
        provider,
        googleId: id,
        email: emails[0].value,
        firstName: name.givenName,
        lastName: name.familyName,
        avatar: photos?.[0]?.value,
      };
      return await this.authService.authenticateGoogle(userProfile);
    } catch (error) {
      console.log('error', error);
    }
  }
}
