import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Email of the authenticated user',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User ID of the authenticated user',
    example: '1234567890',
  })
  userId: ObjectId;
}
