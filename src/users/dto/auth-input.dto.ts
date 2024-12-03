import { IsEmail, IsString } from 'class-validator';
import { ObjectId } from 'mongodb';

export class AuthInputDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
