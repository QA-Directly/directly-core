import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ObjectId } from 'mongodb';

export class LoginResponseDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'User ID of the authenticated user',
    example: '1234567890',
  })
  _id: ObjectId;

  @IsEmail()
  @ApiProperty({
    description: 'Email of the authenticated user',
    example: 'user@example.com',
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: 'Role of the authenticated user',
    example: 'user',
  })
  role: string;
}
