import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    if (transactions.length === 0) {
      return { income: 0, outcome: 0, total: 0 };
    }

    const transactionByIncome = await this.find({ where: { type: 'income' } });

    const income = transactionByIncome.reduce(
      (sum: number, currentValue: Transaction) => {
        return sum + currentValue.value;
      },
      0,
    );

    const transactionByOutcome = await this.find({
      where: { type: 'outcome' },
    });

    const outcome = transactionByOutcome.reduce(
      (sum: number, currentValue: Transaction) => {
        return sum + currentValue.value;
      },
      0,
    );

    const total = income - outcome;

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
