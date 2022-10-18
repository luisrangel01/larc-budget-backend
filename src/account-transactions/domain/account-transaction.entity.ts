import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

import { User } from 'src/auth/domain/user.entity';
import { Account } from 'src/accounts/domain/account.entity';
import {
  AccountTransactionStatus,
  AccountTransactionType,
} from './account-transactions.enums';

@Entity()
export class AccountTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 5 })
  currency: string;

  @Column()
  type: AccountTransactionType;

  @Column({ nullable: false })
  amount: number;

  @Column()
  currentBalance: number;

  @Column('text')
  note: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  updatedAt: Date;

  @Column()
  status: AccountTransactionStatus;

  @Column()
  isReversion: boolean;

  @ManyToOne((_type) => User, (user) => user.tasks, { eager: false })
  @Exclude({ toPlainOnly: true })
  user: User;

  // @ManyToOne(() => Account, (account) => account.accountTransactions)
  // account: Account;

  @ManyToOne((_type) => Account, (account) => account.accountTransactions, {
    eager: false,
  })
  @Exclude({ toPlainOnly: true })
  account: Account;
}
