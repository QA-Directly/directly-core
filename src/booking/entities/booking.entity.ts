import { Column, Entity, ObjectIdColumn } from 'typeorm';

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

  @Column()
  userId: string; // Store only the User ID

  @Column()
  serviceId: string; // Store only the Service ID
}
