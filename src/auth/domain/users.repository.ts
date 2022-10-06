import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  DataSource,
  DeleteResult,
  FindOneOptions,
  Repository,
  UpdateResult,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './user.entity';
import { UserStatus } from './user.enums';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
// import { UpdateTaskDto } from './dto/update-task.dto';
// import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

@Injectable()
export class UsersRepositoryService {
  constructor(private dataSource: DataSource) {}

  public get repository(): Repository<User> {
    return this.dataSource.getRepository(User);
  }

  findOne(options: FindOneOptions<User>) {
    return this.dataSource.getRepository(User).findOne(options);
  }

  // async getTasks(filterDto: GetTasksFilterDto): Promise<User[]> {
  //   const { status, search } = filterDto;

  //   if (!status && !search) {
  //     return this.dataSource.getRepository(User).createQueryBuilder().getMany();
  //   }

  //   let tasks: User[];

  //   if (status && search) {
  //     tasks = await this.dataSource
  //       .getRepository(User)
  //       .createQueryBuilder()
  //       .andWhere('status = :status', { status: status })
  //       .andWhere(
  //         `(LOWER(title) LIKE LOWER(:search) OR LOWER(description) LIKE LOWER(:search))`,
  //         {
  //           search: `%${search}%`,
  //         },
  //       )
  //       .getMany();

  //     return tasks;
  //   }

  //   if (status) {
  //     tasks = await this.dataSource
  //       .getRepository(User)
  //       .createQueryBuilder()
  //       .andWhere('status = :status', { status: status })
  //       .getMany();
  //   }

  //   if (search) {
  //     tasks = await this.dataSource
  //       .getRepository(User)
  //       .createQueryBuilder()
  //       .andWhere(
  //         `LOWER(title) LIKE LOWER(:search) OR LOWER(description) LIKE LOWER(:search)`,
  //         {
  //           search: `%${search}%`,
  //         },
  //       )
  //       .getMany();
  //   }

  //   return tasks;
  // }

  async createUser(createUserDto: AuthCredentialsDto): Promise<User> {
    const { username, password } = createUserDto;

    // hash
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.dataSource.getRepository(User).create({
      username,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
    });

    try {
      await this.dataSource.getRepository(User).save(user);
    } catch (err) {
      if (err.code === '23505') {
        // duplicate username
        throw new ConflictException(`Username already exists`);
      } else {
        throw new InternalServerErrorException();
      }
    }

    return user;
  }

  // async updateTask(
  //   id: string,
  //   updateTaskDto: UpdateTaskDto,
  // ): Promise<UpdateResult> {
  //   const { title, description } = updateTaskDto;

  //   const retult = await this.dataSource
  //     .createQueryBuilder()
  //     .update(User)
  //     .set({
  //       ...(title ? { title: title } : {}),
  //       ...(description ? { description: description } : {}),
  //     })
  //     .where('id = :id', { id: id })
  //     .execute();

  //   return retult;
  // }

  // async deleteTask(id: string): Promise<DeleteResult> {
  //   const result = await this.dataSource.getRepository(User).delete(id);
  //   return result;
  // }
}
