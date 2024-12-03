import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordBodyDto {
  @ApiProperty({
    description: 'The new password the user wants to set',
    type: String,
  })
  @IsString()
  newPassword: string;
}
