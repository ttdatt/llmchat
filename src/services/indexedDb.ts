import { Thread } from '@/types/Message';
import Dexie, { Table } from 'dexie';

export class IndexedDatabase extends Dexie {
  threads!: Table<Thread>;

  constructor() {
    super('myDatabase');
    this.version(1).stores({
      threads: 'id',
    });
  }
}

export const db = new IndexedDatabase();
