import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  ObjectIdColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Booking } from 'src/booking/entities/booking.entity';

@Entity('services')
export class Service {
  @ObjectIdColumn()
  id: string;

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

  @OneToOne(() => User, (user) => user.serviceDetails)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Booking, (booking) => booking.service, { eager: true })
  @JoinColumn()
  bookings: Booking[];

  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';
}
