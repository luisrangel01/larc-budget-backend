import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { AccountTransactionType } from '../account-transactions.enums';

export class GetAccountTransactionsFilterDto {
  @IsOptional()
  @IsEnum(AccountTransactionType)
  type: AccountTransactionType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search: string;
}
