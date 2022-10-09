import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateAccountTransactionDto {
  @IsOptional()
  @IsNotEmpty()
  currency: string;

  @IsOptional()
  @IsNotEmpty()
  note: string;
}
