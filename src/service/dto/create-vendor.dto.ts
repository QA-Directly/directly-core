import { IsString, IsNumber, IsEmail } from 'class-validator';

export class CreateVendorDto {
  @IsString()
  businessName: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  country: string;

  @IsNumber()
  phoneNumber: string;

  @IsEmail()
  email: string;

  @IsString()
  category: string;

  @IsString()
  description: string;

  @IsString()
  idImage: string;
}
