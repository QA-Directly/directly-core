import { Entity, Column, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('service-providers')
export class Service {
  @ObjectIdColumn()
  _id: ObjectId;

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
  description: string;

  @Column()
  idImage: string;

  @Column()
  userId: ObjectId;

  @Column({ default: 'regular' })
  status: string;

  @Column({ default: 0 })
  averageRating: number;
}
