import { getRepository } from 'typeorm';
// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getRepository(Transaction);
    const checkTransactionExists = await transactionRepository.findOne({
      where: { id },
    });
    if (!checkTransactionExists) {
      throw new Error('Transaction not found');
    }

    await transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
