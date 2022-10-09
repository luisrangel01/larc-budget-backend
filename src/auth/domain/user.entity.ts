import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Task } from 'src/tasks/domain/task.entity';
import { Account } from 'src/accounts/domain/account.entity';
import { UserStatus } from './user.enums';
import { AccountTransaction } from 'src/account-transactions/domain/account-transaction.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  status: UserStatus;

  @OneToMany((_type) => Task, (task) => task.user, { eager: false })
  tasks: Task[];

  @OneToMany((_type) => Account, (account) => account.user, { eager: false })
  accounts: Account[];

  @OneToMany(
    (_type) => AccountTransaction,
    (accountTransaction) => accountTransaction.user,
    { eager: false },
  )
  accountTransactions: AccountTransaction[];
}
