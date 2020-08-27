import { getRepository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);
    const getTransactions = getCustomRepository(TransactionsRepository);
    const { balance } = await getTransactions.getBalance();
    if (type === 'outcome' && balance.total < value) {
      throw new AppError("Invalid outcome value. You' re not have money");
    }

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Invalid balance type');
    }

    const findCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    const newCategory = categoryRepository.create({
      title: category,
    });

    const category_id = findCategory
      ? findCategory
      : await categoryRepository.save(newCategory);

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category_id: category_id.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
