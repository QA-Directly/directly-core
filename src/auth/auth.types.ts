import { Request } from 'express';
import { User } from 'src/users/entities/user.entity';

export type AuthInput = { email: string; password: string };
export type GoogleData = {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  provider: string;
};
export type FacebookData = {
  provider: string;
  facebookId: string;
  email: string;
  firstName: string;
  lastName: string;
};
export interface AuthRequest extends Request {
  user: {
    userId: number;
    email: string;
  };
}
export interface SocialRequest extends Request {
  user: User;
}
