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
import { AuthCredentialsSignUpDto } from './dto/auth-credentials.dto';

@Injectable()
export class UsersRepositoryService {
  constructor(private dataSource: DataSource) {}

  public get repository(): Repository<User> {
    return this.dataSource.getRepository(User);
  }

  findOne(options: FindOneOptions<User>) {
    return this.dataSource.getRepository(User).findOne(options);
  }

  async createUser(createUserDto: AuthCredentialsSignUpDto): Promise<User> {
    const { username, password, name } = createUserDto;

    // hash
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.dataSource.getRepository(User).create({
      username,
      password: hashedPassword,
      name,
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
}
