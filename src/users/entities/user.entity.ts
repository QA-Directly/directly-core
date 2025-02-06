import { Column, Entity, ObjectIdColumn, OneToOne, OneToMany } from 'typeorm';
import { Service } from '../../service/entities/service.entity';
import { IsIn } from 'class-validator';
import { Booking } from 'src/booking/entities/booking.entity';

@Entity('users')
export class User {
  @ObjectIdColumn()
  id: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  provider?: string;

  @Column({ nullable: true })
  facebookId?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ default: 'regular' })
  @IsIn(['regular', 'vendor'])
  role?: string;

  @Column({ nullable: true })
  @OneToOne(() => Service, (service) => service.user)
  serviceDetails?: Service;

  @Column({ nullable: true })
  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @Column({ default: false })
  isVerified?: boolean;

  @Column({ nullable: true })
  verificationToken?: string;

  @Column({ nullable: true })
  verificationTokenExpiration?: Date;

  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ nullable: true })
  refreshTokenExpiration?: Date;

  @Column({ nullable: true })
  resetToken?: string;

  @Column({ nullable: true })
  resetTokenExpiration?: Date;
}
