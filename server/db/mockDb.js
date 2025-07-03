// Mock database implementation to simulate MongoDB operations
class MockDatabase {
  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.connected = false;
  }

  connect() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.connected = true;
        console.log('Mock database connected successfully');
        resolve();
      }, 100);
    });
  }

  disconnect() {
    this.connected = false;
    console.log('Mock database disconnected');
  }

  // User operations
  async findUser(query) {
    if (query.email) {
      for (let [id, user] of this.users) {
        if (user.email === query.email) {
          return { _id: id, ...user };
        }
      }
    }
    if (query._id) {
      const user = this.users.get(query._id);
      return user ? { _id: query._id, ...user } : null;
    }
    return null;
  }

  async createUser(userData) {
    const id = Date.now().toString();
    const user = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return { _id: id, ...user };
  }

  async updateUser(id, updateData) {
    const user = this.users.get(id);
    if (!user) return null;
    
    const updatedUser = {
      ...user,
      ...updateData,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return { _id: id, ...updatedUser };
  }

  // Transaction operations
  async findTransactions(query) {
    const results = [];
    for (let [id, transaction] of this.transactions) {
      let matches = true;
      
      if (query.userId && transaction.userId !== query.userId) {
        matches = false;
      }
      
      if (matches) {
        results.push({ _id: id, ...transaction });
      }
    }
    
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async createTransaction(transactionData) {
    const id = Date.now().toString();
    const transaction = {
      ...transactionData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.transactions.set(id, transaction);
    return { _id: id, ...transaction };
  }

  async updateTransaction(id, updateData) {
    const transaction = this.transactions.get(id);
    if (!transaction) return null;
    
    const updatedTransaction = {
      ...transaction,
      ...updateData,
      updatedAt: new Date()
    };
    this.transactions.set(id, updatedTransaction);
    return { _id: id, ...updatedTransaction };
  }
}

export default new MockDatabase();