import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

import { User } from 'src/auth/domain/user.entity';
import { AccountStatus } from './account.enums';

@Entity()
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  currency: string;

  @Column()
  status: AccountStatus;

  @ManyToOne((_type) => User, (user) => user.accounts, { eager: false })
  @Exclude({ toPlainOnly: true })
  user: User;
}
