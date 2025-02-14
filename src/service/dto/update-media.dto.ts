import { ObjectId } from 'mongodb';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateMediaDto {
  @ApiProperty({ description: 'Service ID' })
  serviceId: ObjectId;

  @ApiProperty({ description: 'The old file URL' })
  @IsString()
  oldFileUrl: string;

  @ApiProperty({ description: 'The new file URL' })
  @IsString()
  newFileUrl: string;
}
