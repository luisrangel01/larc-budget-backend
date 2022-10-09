import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  currency: string;

  @IsNotEmpty()
  currentBalance: number;

  @IsNotEmpty()
  color: string;

  @IsNotEmpty()
  @IsOptional()
  creditCardLimit: number;

  @IsNotEmpty()
  @IsOptional()
  cutOffDate: number;

  @IsNotEmpty()
  @IsOptional()
  paymentDate: number;
}
