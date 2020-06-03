import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import uploadConfig from '../config/upload';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

interface Request {
  filename: string;
}

interface RequestTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<RequestTransaction[]> {
    if (filename.split('.').pop() !== 'csv') {
      throw new AppError('File not support.');
    }

    const csvFilePath = path.join(uploadConfig.directory, filename);

    const transactions = await this.loadCSV(csvFilePath);

    return transactions;
  }

  private async loadCSV(csvFilePath: string): Promise<RequestTransaction[]> {
    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: RequestTransaction[] = [];

    parseCSV.on('data', transaction => {
      transactions.push({
        title: transaction[0],
        type: transaction[1],
        value: transaction[2],
        category: transaction[3],
      });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return transactions;
  }
}

export default ImportTransactionsService;
