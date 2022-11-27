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
import { TransferDto } from './dto/transfer.dto';
import { UpdateAccountTransactionStatusDto } from './dto/update-account-transaction-status.dto';
import { ResultTransfer, ResultUpdate } from './account-transaction.interface';

@Injectable()
export class AccountTransactionsRepositoryService {
  private logger = new Logger('AccountTransactionsRepositoryService');

  constructor(private dataSource: DataSource) {}

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
      const { type, search } = filterDto;

      if (!type && !search) {
        return this.dataSource
          .getRepository(AccountTransaction)
          .createQueryBuilder()
          .where({ account: accountId })
          .andWhere('status = :status', { status: 'ACTIVE' })
          .getMany();
      }

      let accountTransactions: AccountTransaction[];

      if (type && search) {
        accountTransactions = await this.dataSource
          .getRepository(AccountTransaction)
          .createQueryBuilder()
          .where({ account: accountId })
          .andWhere('status = :status', { status: 'ACTIVE' })
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
          .andWhere('status = :status', { status: 'ACTIVE' })
          .andWhere('type = :type', { type: type })
          .getMany();
      }

      if (search) {
        accountTransactions = await this.dataSource
          .getRepository(AccountTransaction)
          .createQueryBuilder()
          .where({ account: accountId })
          .andWhere('status = :status', { status: 'ACTIVE' })
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
    const { accountId, currency, type, amount, note, isReversion } =
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
        status: isReversion
          ? AccountTransactionStatus.REVERSION
          : AccountTransactionStatus.ACTIVE,
        isReversion: isReversion ? isReversion : false,
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

    const result = await this.dataSource
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

    return result;
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
        isReversion: false,
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

    const result = await this.dataSource
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

    return result;
  }

  async transfer(
    user: User,
    transferDto: TransferDto,
  ): Promise<ResultTransfer> {
    const { originAccountId, destinationAccountId, currency, amount, note } =
      transferDto;
    const originType: AccountTransactionType = AccountTransactionType.DEBIT;
    const destinationType: AccountTransactionType =
      AccountTransactionType.CREDIT;

    const originCreateAccountTransactionDto: CreateAccountTransactionDto = {
      accountId: originAccountId,
      currency,
      type: originType,
      amount,
      note: `${note} - TRANSFER - DEBIT`,
      isReversion: false,
    };

    const originAccountTransaction = await this.createAccountTransaction(
      user,
      originCreateAccountTransactionDto,
    );

    const destinationCreateAccountTransactionDto: CreateAccountTransactionDto =
      {
        accountId: destinationAccountId,
        currency,
        type: destinationType,
        amount,
        note: `${note} - TRANSFER - CREDIT`,
        isReversion: false,
      };

    const destinationAccountTransaction = await this.createAccountTransaction(
      user,
      destinationCreateAccountTransactionDto,
    );

    return { originAccountTransaction, destinationAccountTransaction };
  }

  async updateAccountTransactionStatus(
    user: User,
    id: string,
    updateAccountTransactionStatusDto: UpdateAccountTransactionStatusDto,
  ): Promise<ResultUpdate> {
    const transaction = await this.findOne({
      where: { id, status: AccountTransactionStatus.ACTIVE },
      relations: { account: true },
    });

    if (!transaction) {
      return { transaction };
    }

    const { status } = updateAccountTransactionStatusDto;

    const result = await this.dataSource
      .createQueryBuilder()
      .update(AccountTransaction)
      .set({
        ...(status ? { status: status } : {}),
        updatedAt: new Date(),
      })
      .where('userId = :userId', { userId: user.id })
      .andWhere('id = :id', { id: id })
      .execute();

    const revertType: AccountTransactionType =
      transaction.type === AccountTransactionType.CREDIT
        ? AccountTransactionType.DEBIT
        : AccountTransactionType.CREDIT;

    const revertCreateAccountTransactionDto: CreateAccountTransactionDto = {
      accountId: transaction.account.id,
      currency: transaction.currency,
      type: revertType,
      amount: transaction.amount,
      note: `${transaction.note} - REVERT`,
      isReversion: true,
    };

    const revertAccountTransaction = await this.createAccountTransaction(
      user,
      revertCreateAccountTransactionDto,
    );

    return {
      transaction,
      updateResult: result,
      revertAccountTransaction,
    };
  }
}
