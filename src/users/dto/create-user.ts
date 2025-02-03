import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'johndoe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'The first name of the user',
    example: 'John',
  })
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'The last name of the user',
    example: 'Doe',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Google ID for authentication',
    example: '12345678',
  })
  @IsString()
  @IsOptional()
  googleId?: string;

  @ApiPropertyOptional({
    description: 'Facebook ID for authentication',
    example: '12345678',
  })
  @IsString()
  @IsOptional()
  facebookId?: string;

  @ApiPropertyOptional({
    description: 'Avatar URL for the user',
    example: 'https://example.com/avatar.jpg',
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'The provider for the user authentication',
    example: 'local',
  })
  @IsString()
  @IsOptional()
  provider: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    description: 'Indicates if the user is verified',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Verification token for email confirmation',
    example: 'verificationToken123',
  })
  @IsString()
  @IsOptional()
  verificationToken?: string;

  @ApiPropertyOptional({
    description: 'Verification token expiration date',
    example: '2024-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  verificationTokenExpiration?: Date;

  @ApiPropertyOptional({
    description: 'The role of the user',
    example: 'regular',
  })
  @IsString()
  @IsOptional()
  role?: string;

  // @ApiPropertyOptional({
  //   description: 'Password reset token for the user',
  //   example: 'resetToken123',
  // })
  // @IsString()
  // @IsOptional()
  // resetToken?: string;

  // @ApiPropertyOptional({
  //   description: 'Password reset token expiration date',
  //   example: '2024-12-31T23:59:59Z',
  // })
  // @IsDateString()
  // @IsOptional()
  // resetTokenExpiration?: Date;
}
