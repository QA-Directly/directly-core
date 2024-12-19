import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString } from 'class-validator';

export class LoginResponseDto {
  @IsNumber()
  @ApiProperty({
    description: 'User ID of the authenticated user',
    example: '1234567890',
  })
  id: string;

  @IsString()
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @IsString()
  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken?: string;

  @IsEmail()
  @ApiProperty({
    description: 'Email of the authenticated user',
    example: 'user@example.com',
  })
  email: string;
}
