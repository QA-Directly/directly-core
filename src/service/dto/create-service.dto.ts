import { IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({
    description: 'The name of the business',
    example: 'Adeola’s Bakery',
  })
  @IsString()
  businessName: string;

  @ApiProperty({ description: 'The business address', example: '123 Main St' })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'The city where the business is located',
    example: 'Lagos',
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'The state where the business is located',
    example: 'Lagos State',
  })
  @IsString()
  state: string;

  @ApiProperty({
    description: 'The country where the business is located',
    example: 'Nigeria',
  })
  @IsString()
  country: string;

  @ApiProperty({
    description: 'The business phone number',
    example: '2348123456789',
  })
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'The business email address',
    example: 'info@adeolabakery.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The business category', example: 'Bakery' })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'A brief description of the business',
    example: 'We specialize in freshly baked goods.',
  })
  @IsString()
  description: string;
}
