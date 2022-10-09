import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateAccountDto {
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @IsNotEmpty()
  @IsOptional()
  type: string;

  @IsNotEmpty()
  @IsOptional()
  currency: string;

  @IsNotEmpty()
  @IsOptional()
  currentBalance: number;

  @IsNotEmpty()
  @IsOptional()
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
