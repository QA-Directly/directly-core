import { Column, Entity, ManyToOne, ObjectIdColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Service } from '../../service/entities/service.entity';

@Entity('bookings')
export class Booking {
  @ObjectIdColumn()
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  date: Date;

  @Column()
  address: string;

  @Column()
  time: string;

  @Column()
  phone: string;

  @Column()
  note: string;

  @ManyToOne(() => User, (user) => user.bookings, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Service, (service) => service.bookings, { eager: true })
  @JoinColumn({ name: 'vendorId' })
  service: Service;
}
