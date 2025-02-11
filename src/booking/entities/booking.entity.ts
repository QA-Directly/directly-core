import { Column, Entity, JoinColumn, ManyToOne, ObjectIdColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Service } from '../../service/entities/service.entity';
import { ObjectId } from 'mongodb';

@Entity('bookings')
export class Booking {
  @ObjectIdColumn()
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  date: string;

  @Column()
  address: string;

  @Column()
  time: string;

  @Column()
  phone: string;

  @Column()
  status: string;

  @Column()
  note: string;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Service, (service) => service.bookings)
  @JoinColumn()
  service: Service;

  @Column()
  userId: ObjectId;

  @Column()
  serviceId: ObjectId;
}
