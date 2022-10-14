import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';

import { User } from 'src/auth/domain/user.entity';
import { AccountTransaction } from '../domain/account-transaction.entity';
import { AccountTransactionsRepositoryService } from '../domain/account-transactions.repository';
import { CreateAccountTransactionDto } from '../domain/dto/create-account-transaction.dto';
import { UpdateAccountTransactionDto } from '../domain/dto/update-account-transaction.dto';
import { GetAccountTransactionsFilterDto } from '../domain/dto/get-account-transactions-filter.dto';
import { TransferDto } from '../domain/dto/transfer.dto';

@Injectable()
export class AccountTransactionsService {
  constructor(
    @Inject(AccountTransactionsRepositoryService)
    private readonly accountTransactionsRepositoryService: AccountTransactionsRepositoryService,
  ) {}

  getAccountTransactions(
    user: User,
    filterDto: GetAccountTransactionsFilterDto,
    accountId: string,
  ): Promise<AccountTransaction[]> {
    return this.accountTransactionsRepositoryService.getAccountTransactions(
      user,
      filterDto,
      accountId,
    );
  }

  async getAccountTransactionById(
    user: User,
    id: string,
  ): Promise<AccountTransaction> {
    const found = await this.accountTransactionsRepositoryService.findOne({
      where: { id },
    });
    if (!found) {
      throw new NotFoundException(`Transaction with ID "${id}" not found`);
    }

    return found;
  }

  createAccountTransaction(
    user: User,
    createAccountTransactionDto: CreateAccountTransactionDto,
  ): Promise<AccountTransaction> {
    return this.accountTransactionsRepositoryService.createAccountTransaction(
      user,
      createAccountTransactionDto,
    );
  }

  async updateAccountTransaction(
    user: User,
    id: string,
    updateAccountTransactionDto: UpdateAccountTransactionDto,
  ): Promise<UpdateResult> {
    const result =
      await this.accountTransactionsRepositoryService.updateAccountTransaction(
        user,
        id,
        updateAccountTransactionDto,
      );
    if (result.affected === 0) {
      throw new NotFoundException(`Transaction with ID "${id}" not found`);
    }
    return result;
  }

  async deleteAccountTransaction(
    user: User,
    id: string,
  ): Promise<DeleteResult> {
    const result =
      await this.accountTransactionsRepositoryService.deleteAccountTransaction(
        user,
        id,
      );
    if (result.affected === 0) {
      throw new NotFoundException(`Transaction with ID "${id}" not found`);
    }
    return result;
  }

  transfer(
    user: User,
    transferDto: TransferDto,
  ): Promise<AccountTransaction[]> {
    return this.accountTransactionsRepositoryService.transfer(
      user,
      transferDto,
    );
  }
}
