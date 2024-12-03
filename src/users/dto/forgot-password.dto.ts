import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'The email address of the user requesting password reset',
    example: 'johndoe@gmail.com',
  })
  @IsEmail()
  email: string;
}
