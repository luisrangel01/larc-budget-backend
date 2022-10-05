import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsNotEmpty()
  description: string;
}
