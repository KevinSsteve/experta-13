import { openDB, IDBPDatabase } from 'idb';

interface OfflineTransaction {
  id: string;
  type: 'sale' | 'expense';
  description: string;
  amount: number;
  timestamp: string;
  date: string;
  synced: boolean;
  user_id?: string;
}

class OfflineStorage {
  private db: IDBPDatabase | null = null;

  async init() {
    if (this.db) return;

    this.db = await openDB('experta-offline', 1, {
      upgrade(db) {
        const store = db.createObjectStore('transactions', { keyPath: 'id' });
        store.createIndex('by-date', 'date');
        store.createIndex('by-type', 'type');
        store.createIndex('by-synced', 'synced');
      },
    });
  }

  async saveTransaction(transaction: Omit<OfflineTransaction, 'id' | 'synced'>) {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const fullTransaction: OfflineTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
      synced: false,
    };

    await this.db.add('transactions', fullTransaction);
    return fullTransaction;
  }

  async getTodaysStats() {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const today = new Date().toISOString().split('T')[0];
    const todaysTransactions = await this.db.getAllFromIndex('transactions', 'by-date', today);

    const sales = todaysTransactions.filter(t => t.type === 'sale');
    const expenses = todaysTransactions.filter(t => t.type === 'expense');

    return {
      todaySales: sales.length,
      todayExpenses: expenses.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.amount, 0),
      totalExpenses: expenses.reduce((sum, expense) => sum + expense.amount, 0),
    };
  }

  async getPendingSync() {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const allTransactions = await this.db.getAll('transactions');
    return allTransactions.filter(t => !t.synced);
  }

  async markAsSynced(transactionId: string) {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const transaction = await this.db.get('transactions', transactionId);
    if (transaction) {
      transaction.synced = true;
      await this.db.put('transactions', transaction);
    }
  }

  async getAllTransactions() {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.getAll('transactions');
  }

  async clearSyncedTransactions() {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const allTransactions = await this.db.getAll('transactions');
    const syncedTransactions = allTransactions.filter(t => t.synced);
    for (const transaction of syncedTransactions) {
      await this.db.delete('transactions', transaction.id);
    }
  }
}

export const offlineStorage = new OfflineStorage();
export type { OfflineTransaction };