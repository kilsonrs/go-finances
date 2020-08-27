import CreateTransactionService from './CreateTransactionService';
import Transaction from '../models/Transaction';
import csvParse from 'csv-parse';
import AppError from '../errors/AppError';

import fs from 'fs';
import path from 'path';
import uploadConfig from '../config/upload';

interface Request {
  importFilename: string;
  type: string;
}

class ImportTransactionsService {
  private async parseCSV(csvFilePath: string): Promise<string[]> {
    const readCSVStream = fs.createReadStream(csvFilePath);
    const parseStream = csvParse({ from_line: 2, ltrim: true, rtrim: true });

    const parseCSV = readCSVStream.pipe(parseStream);

    let lines: string[] = [];

    parseCSV.on('data', line => lines.push(line));
    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return lines;
  }

  async execute({ importFilename }: Request): Promise<Transaction[]> {
    const csvFilePath = path.join(uploadConfig.destination, importFilename);
    const linesParsed = await this.parseCSV(csvFilePath);
    const createTransaction = new CreateTransactionService();

    let transactions: Transaction[] = [];

    for (let line of linesParsed) {
      const [title, type, value, category] = line;
      if (type !== 'income' && type !== 'outcome') {
        throw new AppError('Invalid balance type');
      }
      const transaction = await createTransaction.execute({
        title,
        type,
        value: parseInt(value),
        category,
      });
      transactions.push(transaction);
      console.log(transaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
