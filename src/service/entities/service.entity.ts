import { Entity, Column, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('service-providers')
export class Service {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  userId: ObjectId;

  @Column()
  businessName: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  country: string;

  @Column()
  phoneNumber: string;

  @Column()
  email: string;

  @Column()
  category: string;

  @Column()
  mediaFiles: string[];

  @Column()
  description: string;

  @Column()
  profilePicture: string;

  @Column()
  idImage: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ default: 0, nullable: true })
  averageRating?: number;
}
