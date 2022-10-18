import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

import { AccountTransactionType } from '../account-transactions.enums';

export class CreateAccountTransactionDto {
  @IsNotEmpty()
  accountId: string;

  @IsNotEmpty()
  currency: string;

  @IsNotEmpty()
  type: AccountTransactionType;

  @IsNotEmpty()
  amount: number;

  @IsOptional()
  @IsNotEmpty()
  note: string;

  @IsOptional()
  @IsBoolean()
  isReversion: boolean;
}
