import { openDB } from 'idb';

const DB_NAME = 'MediaGalleryDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });
        // Create indexes for better querying
        store.createIndex('createdAt', 'createdAt');
        store.createIndex('title', 'title');
      }
    }
  });
};

// Image CRUD Operations
export const dbOperations = {
  async addImage(imageData) {
    const db = await initDB();
    return db.add(STORE_NAME, {
      ...imageData,
      createdAt: new Date()
    });
  },

  async getAllImages() {
    const db = await initDB();
    return db.getAll(STORE_NAME);
  },

  async getImage(id) {
    const db = await initDB();
    return db.get(STORE_NAME, id);
  },

  async updateImage(id, updates) {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const current = await store.get(id);
    await store.put({ ...current, ...updates });
    return tx.done;
  },

  async deleteImage(id) {
    const db = await initDB();
    return db.delete(STORE_NAME, id);
  },

  async clearAllImages() {
    const db = await initDB();
    return db.clear(STORE_NAME);
  }
};
