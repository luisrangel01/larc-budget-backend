import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  DataSource,
  DeleteResult,
  FindOneOptions,
  Repository,
  UpdateResult,
} from 'typeorm';

import { User } from 'src/auth/domain/user.entity';
import { Account } from './account.entity';
import { AccountStatus } from './account.enums';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { GetAccountsFilterDto } from './dto/get-accounts-filter.dto';

@Injectable()
export class AccountsRepositoryService {
  private logger = new Logger('AccountsRepositoryService');

  constructor(private dataSource: DataSource) {}

  public get repository(): Repository<Account> {
    return this.dataSource.getRepository(Account);
  }

  getAccount(options: FindOneOptions<Account>) {
    return this.dataSource.getRepository(Account).findOne(options);
  }

  async getAccounts(
    user: User,
    filterDto: GetAccountsFilterDto,
  ): Promise<Account[]> {
    try {
      const { status, search } = filterDto;

      if (!status && !search) {
        return this.dataSource
          .getRepository(Account)
          .createQueryBuilder()
          .where({ user })
          .getMany();
      }

      let accounts: Account[];

      if (status && search) {
        accounts = await this.dataSource
          .getRepository(Account)
          .createQueryBuilder()
          .where({ user })
          .andWhere('status = :status', { status: status })
          .andWhere(
            `(LOWER(title) LIKE LOWER(:search) OR LOWER(description) LIKE LOWER(:search))`,
            {
              search: `%${search}%`,
            },
          )
          .getMany();

        return accounts;
      }

      if (status) {
        accounts = await this.dataSource
          .getRepository(Account)
          .createQueryBuilder()
          .where({ user })
          .andWhere('status = :status', { status: status })
          .getMany();
      }

      if (search) {
        accounts = await this.dataSource
          .getRepository(Account)
          .createQueryBuilder()
          .where({ user })
          .andWhere(
            `(LOWER(title) LIKE LOWER(:search) OR LOWER(description) LIKE LOWER(:search))`,
            {
              search: `%${search}%`,
            },
          )
          .getMany();
      }

      return accounts;
    } catch (err) {
      this.logger.error(
        `Failed to get accounts for user "${
          user.username
        }". Filters: ${JSON.stringify(filterDto)}`,
        err,
      );
      throw new InternalServerErrorException();
    }
  }

  async createAccount(
    user: User,
    createAccountDto: CreateAccountDto,
  ): Promise<Account> {
    const {
      name,
      type,
      currency,
      currentBalance,
      color,
      creditCardLimit,
      cutOffDate,
      paymentDate,
    } = createAccountDto;

    const account = this.dataSource.getRepository(Account).create({
      name,
      type,
      currency,
      currentBalance,
      color,
      creditCardLimit,
      cutOffDate,
      paymentDate,
      status: AccountStatus.ACTIVE,
      user,
    });

    await this.dataSource.getRepository(Account).save(account);

    return account;
  }

  async updateAccount(
    user: User,
    id: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<UpdateResult> {
    const {
      name,
      type,
      currency,
      currentBalance,
      color,
      creditCardLimit,
      cutOffDate,
      paymentDate,
    } = updateAccountDto;

    const retult = await this.dataSource
      .createQueryBuilder()
      .update(Account)
      .set({
        ...(name ? { name: name } : {}),
        ...(type ? { type: type } : {}),
        ...(currency ? { currency: currency } : {}),
        ...(currentBalance ? { currentBalance: currentBalance } : {}),
        ...(color ? { color: color } : {}),
        ...(creditCardLimit ? { creditCardLimit: creditCardLimit } : {}),
        ...(cutOffDate ? { cutOffDate: cutOffDate } : {}),
        ...(paymentDate ? { paymentDate: paymentDate } : {}),
        updatedAt: new Date(),
      })
      .where('userId = :userId', { userId: user.id })
      .andWhere('id = :id', { id: id })
      .execute();

    return retult;
  }

  async deleteAccount(user: User, id: string): Promise<DeleteResult> {
    const result = await this.dataSource
      .getRepository(Account)
      .delete({ id, user });
    return result;
  }
}
