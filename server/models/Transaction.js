import mockDb from '../db/mockDb.js';

class Transaction {
  constructor(transactionData) {
    this.userId = transactionData.userId;
    this.amount = transactionData.amount;
    this.currency = transactionData.currency || 'USD';
    this.status = transactionData.status || 'pending';
    this.paymentMethod = transactionData.paymentMethod;
    this.description = transactionData.description;
    this.googlePayToken = transactionData.googlePayToken;
    this.transactionId = transactionData.transactionId;
    this.googlePayTransactionId = transactionData.googlePayTransactionId;
    this.metadata = transactionData.metadata || {};
    this.createdAt = transactionData.createdAt;
    this.updatedAt = transactionData.updatedAt;
    this._id = transactionData._id;
  }

  static async find(query = {}) {
    const transactions = await mockDb.findTransactions(query);
    return transactions.map(transaction => new Transaction(transaction));
  }

  static async findOne(query) {
    const transactions = await mockDb.findTransactions(query);
    return transactions.length > 0 ? new Transaction(transactions[0]) : null;
  }

  static async findById(id) {
    const transactions = await mockDb.findTransactions({ _id: id });
    return transactions.length > 0 ? new Transaction(transactions[0]) : null;
  }

  async save() {
    const savedTransaction = await mockDb.createTransaction({
      userId: this.userId,
      amount: this.amount,
      currency: this.currency,
      status: this.status,
      paymentMethod: this.paymentMethod,
      description: this.description,
      googlePayToken: this.googlePayToken,
      transactionId: this.transactionId,
      googlePayTransactionId: this.googlePayTransactionId,
      metadata: this.metadata
    });
    
    // Update this instance with the saved data
    Object.assign(this, savedTransaction);
    return this;
  }

  static async updateOne(query, updateData) {
    const transaction = await this.findOne(query);
    if (!transaction) return null;
    
    const updatedTransaction = await mockDb.updateTransaction(transaction._id, updateData);
    return new Transaction(updatedTransaction);
  }

  static async findByIdAndUpdate(id, updateData) {
    const updatedTransaction = await mockDb.updateTransaction(id, updateData);
    return updatedTransaction ? new Transaction(updatedTransaction) : null;
  }

  static async countDocuments(query = {}) {
    const transactions = await mockDb.findTransactions(query);
    return transactions.length;
  }
}

export default Transaction;