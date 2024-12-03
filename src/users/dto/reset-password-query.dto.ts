import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordQueryDto {
  @ApiProperty({
    description: 'The password reset token received via email',
    type: String,
  })
  @IsString()
  token: string;
}
