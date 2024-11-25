import {
  Column,
  Entity,
  ObjectId,
  ObjectIdColumn,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @ObjectIdColumn()
  id: ObjectId;

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
  avatar?: string;

  @Column({ nullable: true })
  password?: string;

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }

  @BeforeInsert()
  async hashPassword() {
    if (!this.provider || this.provider === 'local') {
      if (this.password) {
        this.password = await bcrypt.hash(this.password, 10);
      } else {
        throw new Error('Password is required for local users');
      }
    }
  }
}
