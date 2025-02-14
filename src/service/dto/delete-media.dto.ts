import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ObjectId } from 'mongodb';

export class DeleteMediaDto {
  @ApiProperty({ description: 'The file URL to delete' })
  @IsString()
  fileUrl: string;
}
