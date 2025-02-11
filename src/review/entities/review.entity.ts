import { ObjectId } from 'mongodb';
import { Entity, Column, ObjectIdColumn, CreateDateColumn } from 'typeorm';

@Entity('reviews')
export class Review {
  @ObjectIdColumn()
  _id: string;

  @Column()
  userId: ObjectId;
  @Column()
  serviceId: ObjectId;

  @Column()
  bookingId: ObjectId;

  @Column()
  rating: number;

  @Column()
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}
