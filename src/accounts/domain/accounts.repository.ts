import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DataSource, DeleteResult, Repository } from 'typeorm';

import { AccountTransactionsRepositoryService } from 'src/account-transactions/domain/account-transactions.repository';
import { User } from 'src/auth/domain/user.entity';
import { Account } from './account.entity';
import { GetAccountsFilterDto } from './dto/get-accounts-filter.dto';

@Injectable()
export class AccountsRepositoryService {
  private logger = new Logger('AccountsRepositoryService');

  constructor(private dataSource: DataSource) {}

  public get repository(): Repository<Account> {
    return this.dataSource.getRepository(Account);
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

  async deleteAccount(user: User, id: string): Promise<DeleteResult> {
    const result = await this.dataSource
      .getRepository(Account)
      .delete({ id, user });
    return result;
  }
}
