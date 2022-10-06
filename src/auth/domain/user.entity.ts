import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Task } from 'src/tasks/domain/task.entity';
import { UserStatus } from './user.enums';

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
}
