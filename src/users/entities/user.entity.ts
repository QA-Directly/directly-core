import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

export type UserRole = 'user' | 'service-provider' | 'admin';

@Entity('users')
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  profilePicture?: string;

  @Column({ nullable: true })
  provider?: string;

  @Column({ nullable: true })
  facebookId?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ type: 'text', default: 'user' })
  role?: string;

  @Column()
  serviceId?: ObjectId;

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
