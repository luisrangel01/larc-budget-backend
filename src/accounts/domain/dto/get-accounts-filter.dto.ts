import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { AccountStatus } from '../account.enums';

export class GetAccountsFilterDto {
  @IsOptional()
  @IsEnum(AccountStatus)
  status: AccountStatus;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search: string;
}
