import { Entity, Column, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';
import { ApiProperty } from '@nestjs/swagger';

@Entity('service-providers')
export class Service {
  @ObjectIdColumn()
  @ApiProperty({ description: 'Unique Service ID', type: 'string' })
  _id: ObjectId;

  @Column()
  @ApiProperty({
    description: 'User ID of the account connected to the provider',
  })
  userId: ObjectId;

  @Column()
  @ApiProperty({ description: 'Business name of the service provider' })
  businessName: string;

  @Column()
  @ApiProperty({ description: 'Service provider address' })
  address: string;

  @Column()
  @ApiProperty({ description: 'City where the service is located' })
  city: string;

  @Column()
  @ApiProperty({ description: 'State where the service is located' })
  state: string;

  @Column()
  @ApiProperty({ description: 'Country of the service provider' })
  country: string;

  @Column()
  @ApiProperty({ description: 'Phone number of the service provider' })
  phoneNumber: string;

  @Column()
  @ApiProperty({ description: 'Email of the service provider' })
  email: string;

  @Column()
  @ApiProperty({ description: 'Category of the service' })
  category: string;

  @Column()
  @ApiProperty({ description: 'media files uploaded by service providers' })
  mediaFiles: string[];

  @Column()
  @ApiProperty({ description: 'Description of the service' })
  description: string;

  @Column()
  @ApiProperty({ description: 'ID image of the service provider' })
  idImage: string;

  @Column({ default: 'regular' })
  @ApiProperty({
    description: 'Status of the service provider',
    default: 'regular',
  })
  status: string;

  @Column({ default: 0 })
  @ApiProperty({
    description: 'Average rating of the service provider',
    default: 0,
  })
  averageRating: number;
}
