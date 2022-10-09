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

import { AccountTransaction } from './account-transaction.entity';
import { AccountTransactionStatus } from './account-transactions.enums';
import { CreateAccountTransactionDto } from './dto/create-account-transaction.dto';
import { UpdateAccountTransactionDto } from './dto/update-account-transaction.dto';
import { GetAccountTransactionsFilterDto } from './dto/get-account-transactions-filter.dto';
import { User } from 'src/auth/domain/user.entity';
import { AccountsRepositoryService } from 'src/accounts/domain/accounts.repository';

@Injectable()
export class AccountTransactionsRepositoryService {
  private logger = new Logger('AccountTransactionsRepositoryService');

  constructor(
    private dataSource: DataSource,
    private accountsRepositoryService: AccountsRepositoryService,
  ) {}

  public get repository(): Repository<AccountTransaction> {
    return this.dataSource.getRepository(AccountTransaction);
  }

  findOne(options: FindOneOptions<AccountTransaction>) {
    return this.dataSource.getRepository(AccountTransaction).findOne(options);
  }

  async getAccountTransactions(
    user: User,
    filterDto: GetAccountTransactionsFilterDto,
    accountId: string,
  ): Promise<AccountTransaction[]> {
    try {
      const { status, search } = filterDto;

      if (!status && !search) {
        return this.dataSource
          .getRepository(AccountTransaction)
          .createQueryBuilder()
          .where({ user })
          .where({ account: accountId })
          .getMany();
      }

      let accountTransactions: AccountTransaction[];

      if (status && search) {
        accountTransactions = await this.dataSource
          .getRepository(AccountTransaction)
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

        return accountTransactions;
      }

      if (status) {
        accountTransactions = await this.dataSource
          .getRepository(AccountTransaction)
          .createQueryBuilder()
          .where({ user })
          .andWhere('status = :status', { status: status })
          .getMany();
      }

      if (search) {
        accountTransactions = await this.dataSource
          .getRepository(AccountTransaction)
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

      return accountTransactions;
    } catch (err) {
      this.logger.error(
        `Failed to get transactions for user "${
          user.username
        }". Filters: ${JSON.stringify(filterDto)}`,
        err,
      );
      throw new InternalServerErrorException();
    }
  }

  async createAccountTransaction(
    user: User,
    createAccountTransactionDto: CreateAccountTransactionDto,
  ): Promise<AccountTransaction> {
    const { accountId, currency, type, amount, note } =
      createAccountTransactionDto;
    const account = await this.accountsRepositoryService.getAccount({
      where: { id: accountId },
    });

    let { currentBalance } = account;

    if (type === 'CREDIT') {
      currentBalance += amount;
    } else {
      currentBalance -= amount;
    }

    const accountTransaction = this.dataSource
      .getRepository(AccountTransaction)
      .create({
        account,
        currency,
        type,
        amount,
        currentBalance,
        note,
        status: AccountTransactionStatus.ACTIVE,
        user,
      });

    await this.dataSource
      .getRepository(AccountTransaction)
      .save(accountTransaction);

    await this.accountsRepositoryService.updateAccount(user, account.id, {
      currentBalance: currentBalance,
      name: null,
      type: null,
      currency: null,
      color: null,
      creditCardLimit: null,
      cutOffDate: null,
      paymentDate: null,
    });

    return accountTransaction;
  }

  async updateAccountTransaction(
    user: User,
    id: string,
    updateAccountTransactionDto: UpdateAccountTransactionDto,
  ): Promise<UpdateResult> {
    const { currency, note } = updateAccountTransactionDto;

    const retult = await this.dataSource
      .createQueryBuilder()
      .update(AccountTransaction)
      .set({
        ...(currency ? { currency: currency } : {}),
        ...(note ? { note: note } : {}),
        updatedAt: new Date(),
      })
      .where('userId = :userId', { userId: user.id })
      .andWhere('id = :id', { id: id })
      .execute();

    return retult;
  }

  async deleteAccountTransaction(
    user: User,
    id: string,
  ): Promise<DeleteResult> {
    const result = await this.dataSource
      .getRepository(AccountTransaction)
      .delete({ id, user });
    return result;
  }
}
