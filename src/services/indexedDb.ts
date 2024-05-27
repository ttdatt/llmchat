import { Thread } from '@/types/Message';
import { User } from '@/types/User';
import Dexie, { Table } from 'dexie';

export class IndexedDatabase extends Dexie {
  threads!: Table<Thread>;
  user!: Table<User>;

  constructor() {
    super('myDatabase');
    this.version(1).stores({
      threads: 'id',
      user: 'id',
    });
  }
}

export const db = new IndexedDatabase();
