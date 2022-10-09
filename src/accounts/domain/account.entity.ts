import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  IsNull,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { User } from 'src/auth/domain/user.entity';
import { AccountStatus } from './account.enums';

@Entity()
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 250 })
  name: string;

  @Column({ length: 100 })
  type: string;

  @Column({ length: 5 })
  currency: string;

  @Column()
  currentBalance: number;

  @Column({ length: 20 })
  color: string;

  @Column({ nullable: true })
  creditCardLimit: number;

  @Column({ nullable: true })
  cutOffDate: number;

  @Column({ nullable: true })
  paymentDate: number;

  @Column({ length: 20 })
  status: AccountStatus;

  @ManyToOne((_type) => User, (user) => user.accounts, { eager: false })
  @Exclude({ toPlainOnly: true })
  user: User;
}
