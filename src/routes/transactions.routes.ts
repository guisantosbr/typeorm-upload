import { Router } from 'express';
import multer from 'multer';
import { getCustomRepository } from 'typeorm';
import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import Transaction from '../models/Transaction';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find({
    select: ['id', 'title', 'value', 'type', 'created_at', 'updated_at'],
    relations: ['category'],
  });
  const balance = await transactionsRepository.getBalance();
  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute({ id });

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { filename } = request.file;
    const importTransactions = new ImportTransactionsService();
    const transactions = await importTransactions.execute({ filename });

    const createTransaction = new CreateTransactionService();

    const transaction = await createTransaction.execute({
      title: transactions[0].title,
      value: transactions[0].value,
      type: transactions[0].type,
      category: transactions[0].category,
    });

    const transaction1 = await createTransaction.execute({
      title: transactions[1].title,
      value: transactions[1].value,
      type: transactions[1].type,
      category: transactions[1].category,
    });

    const transaction2 = await createTransaction.execute({
      title: transactions[2].title,
      value: transactions[2].value,
      type: transactions[2].type,
      category: transactions[2].category,
    });

    const result = [];
    result.push(transaction);
    result.push(transaction1);
    result.push(transaction2);

    return response.json(transactions);
  },
);

export default transactionsRouter;
