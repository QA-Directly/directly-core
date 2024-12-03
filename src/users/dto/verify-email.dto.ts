import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ description: 'Token to verify email' })
  @IsString()
  token: string;
}
