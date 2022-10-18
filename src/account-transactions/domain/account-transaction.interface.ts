import { UpdateResult } from 'typeorm';
import { AccountTransaction } from './account-transaction.entity';

export interface ResultUpdate {
  transaction?: AccountTransaction;
  updateResult?: UpdateResult;
  revertAccountTransaction?: AccountTransaction;
}
