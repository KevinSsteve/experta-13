interface OfflineRecord {
  id: string;
  type: 'sale' | 'expense';
  transcript: string;
  timestamp: string;
  processed: boolean;
  amount?: number;
  description?: string;
  synced: boolean;
}

interface OfflineDB {
  transactions: {
    key: string;
    value: OfflineRecord;
    indexes: { 'by-type': string; 'by-timestamp': string; 'by-synced': boolean };
  };
}

type IDBPDatabase = any;

class OfflineStorageManager {
  private db: any = null;

  async init(): Promise<void> {
    if (this.db) return;

    const { openDB } = await import('idb');
    this.db = await openDB('expertaGoOffline', 1, {
      upgrade(db) {
        const store = db.createObjectStore('transactions', {
          keyPath: 'id',
        });
        store.createIndex('by-type', 'type');
        store.createIndex('by-timestamp', 'timestamp');
        store.createIndex('by-synced', 'synced');
      },
    });
  }

  async saveRecord(record: Omit<OfflineRecord, 'id' | 'synced'>): Promise<string> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const id = crypto.randomUUID();
    const fullRecord: OfflineRecord = {
      ...record,
      id,
      synced: false,
    };

    await this.db.add('transactions', fullRecord);
    return id;
  }

  async getAllRecords(): Promise<OfflineRecord[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return this.db.getAll('transactions');
  }

  async getUnsyncedRecords(): Promise<OfflineRecord[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return this.db.getAllFromIndex('transactions', 'by-synced', false);
  }

  async markAsSynced(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const record = await this.db.get('transactions', id);
    if (record) {
      record.synced = true;
      await this.db.put('transactions', record);
    }
  }

  async deleteRecord(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.delete('transactions', id);
  }

  async getStats(): Promise<{
    totalRecords: number;
    unsyncedRecords: number;
    salesCount: number;
    expensesCount: number;
  }> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const allRecords = await this.getAllRecords();
    const unsyncedRecords = await this.getUnsyncedRecords();

    return {
      totalRecords: allRecords.length,
      unsyncedRecords: unsyncedRecords.length,
      salesCount: allRecords.filter(r => r.type === 'sale').length,
      expensesCount: allRecords.filter(r => r.type === 'expense').length,
    };
  }
}

export const offlineStorage = new OfflineStorageManager();
export type { OfflineRecord };