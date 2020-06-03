import { getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

import AppError from '../errors/AppError';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getRepository(Transaction);

    const transaction = await transactionsRepository.find({ id });
    if (!transaction) {
      throw new AppError('Transaction id not found.');
    }

    const deleteResult = await transactionsRepository.delete(id);

    if (deleteResult.affected !== 1) {
      throw new AppError('Transaction not deleted.');
    }
  }
}

export default DeleteTransactionService;
