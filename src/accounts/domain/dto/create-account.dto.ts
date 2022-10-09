import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNotEmpty()
  currency: string;
}
