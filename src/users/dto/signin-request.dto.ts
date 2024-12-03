import { IsEmail, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({
    description: 'Email of the user',
    example: 'johndoe@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User ID of the authenticated user',
    example: 1234567890,
  })
  @IsNumber()
  userId: number;
}
