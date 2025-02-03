import { Entity, Column, OneToOne, JoinColumn, ObjectIdColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('vendor')
export class Vendor {
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

  @OneToOne(() => User, (user) => user.vendorDetails)
  @JoinColumn()
  user: User;

  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';
}
