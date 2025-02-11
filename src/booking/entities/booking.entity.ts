import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ObjectIdColumn,
} from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('bookings')
export class Booking {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  date: string;

  @Column()
  time: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column()
  status: string;

  @Column()
  note: string;

  @Column({ nullable: true })
  rescheduledFrom: ObjectId;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  userId: ObjectId;

  @Column()
  serviceId: ObjectId;
}
