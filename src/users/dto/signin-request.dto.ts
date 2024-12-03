import { IsEmail, IsNumber } from 'class-validator';

export class SignInDto {
  @IsEmail()
  email: string;

  @IsNumber()
  userId: number;
}
