import { IsNotEmpty, IsOptional } from 'class-validator';

export class TransferDto {
  @IsNotEmpty()
  originAccountId: string;

  @IsNotEmpty()
  destinationAccountId: string;

  @IsNotEmpty()
  currency: string;

  @IsNotEmpty()
  amount: number;

  @IsOptional()
  @IsNotEmpty()
  note: string;
}
