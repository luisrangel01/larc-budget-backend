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
import {
  AccountTransactionStatus,
  AccountTransactionType,
} from './account-transactions.enums';
import { CreateAccountTransactionDto } from './dto/create-account-transaction.dto';
import { UpdateAccountTransactionDto } from './dto/update-account-transaction.dto';
import { GetAccountTransactionsFilterDto } from './dto/get-account-transactions-filter.dto';
import { User } from 'src/auth/domain/user.entity';
import { CreateAccountDto } from 'src/accounts/domain/dto/create-account.dto';
import { Account } from 'src/accounts/domain/account.entity';
import { AccountStatus } from 'src/accounts/domain/account.enums';
import { UpdateAccountDto } from 'src/accounts/domain/dto/update-account.dto';

@Injectable()
export class AccountTransactionsRepositoryService {
  private logger = new Logger('AccountTransactionsRepositoryService');

  constructor(private dataSource: DataSource) {}

  public get repository(): Repository<AccountTransaction> {
    return this.dataSource.getRepository(AccountTransaction);
  }

  findOne(options: FindOneOptions<AccountTransaction>) {
    console.log(options);
    return this.dataSource.getRepository(AccountTransaction).findOne(options);
  }

  async getAccountTransactions(
    user: User,
    filterDto: GetAccountTransactionsFilterDto,
    accountId: string,
  ): Promise<AccountTransaction[]> {
    try {
      const { type, search } = filterDto;

      if (!type && !search) {
        return this.dataSource
          .getRepository(AccountTransaction)
          .createQueryBuilder()
          .where({ account: accountId })
          .getMany();
      }

      let accountTransactions: AccountTransaction[];

      if (type && search) {
        accountTransactions = await this.dataSource
          .getRepository(AccountTransaction)
          .createQueryBuilder()
          .where({ account: accountId })
          .andWhere('type = :type', { type: type })
          .andWhere(
            `(LOWER(note) LIKE LOWER(:search) OR LOWER(note) LIKE LOWER(:search))`,
            {
              search: `%${search}%`,
            },
          )
          .getMany();

        return accountTransactions;
      }

      if (type) {
        accountTransactions = await this.dataSource
          .getRepository(AccountTransaction)
          .createQueryBuilder()
          .where({ account: accountId })
          .andWhere('type = :type', { type: type })
          .getMany();
      }

      if (search) {
        accountTransactions = await this.dataSource
          .getRepository(AccountTransaction)
          .createQueryBuilder()
          .where({ account: accountId })
          .andWhere(
            `(LOWER(note) LIKE LOWER(:search) OR LOWER(note) LIKE LOWER(:search))`,
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
    const account = await this.getAccount({
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

    await this.updateAccount(user, account.id, {
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
      currentBalance: 0,
      color,
      creditCardLimit,
      cutOffDate,
      paymentDate,
      status: AccountStatus.ACTIVE,
      user,
    });

    await this.dataSource.getRepository(Account).save(account);

    if (currentBalance > 0) {
      const type: AccountTransactionType = AccountTransactionType.CREDIT;

      const createAccountTransactionDto: CreateAccountTransactionDto = {
        accountId: account.id,
        currency,
        type,
        amount: currentBalance,
        note: 'ACCOUNT OPENING',
      };

      await this.createAccountTransaction(user, createAccountTransactionDto);
    }

    return account;
  }

  getAccount(options: FindOneOptions<Account>) {
    return this.dataSource.getRepository(Account).findOne(options);
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
}
