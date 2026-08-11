import { SavedApplication, ErrorLog } from '../types';

const DB_NAME = 'ImmigrationAI_DB';
const DB_VERSION = 1;
const APPLICATIONS_STORE_NAME = 'saved_applications';
const ERROR_LOGS_STORE_NAME = 'error_logs';

let db: IDBDatabase;

export const isDBSupported = (): boolean => typeof indexedDB !== 'undefined';

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) return resolve(true);
    if (!isDBSupported()) {
      console.warn('IndexedDB not supported (private mode?). Using in-memory fallback.');
      return resolve(false);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject('Error opening IndexedDB.');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(APPLICATIONS_STORE_NAME)) {
        dbInstance.createObjectStore(APPLICATIONS_STORE_NAME, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(ERROR_LOGS_STORE_NAME)) {
        dbInstance.createObjectStore(ERROR_LOGS_STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

export const saveApplication = (application: SavedApplication): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) return reject('DB not initialized.');
    const transaction = db.transaction(APPLICATIONS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(APPLICATIONS_STORE_NAME);
    const request = store.put(application);
    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error('Save application error:', request.error);
      reject('Error saving application.');
    };
  });
};

export const getAllSavedApplications = (): Promise<SavedApplication[]> => {
  return new Promise((resolve, reject) => {
    if (!db) return reject('DB not initialized.');
    const transaction = db.transaction(APPLICATIONS_STORE_NAME, 'readonly');
    const store = transaction.objectStore(APPLICATIONS_STORE_NAME);
    const request = store.getAll();

    request.onerror = () => {
      console.error('Get all applications error:', request.error);
      reject('Error fetching applications.');
    };

    request.onsuccess = () => {
      // Sort by timestamp descending
      const sorted = request.result.sort((a: SavedApplication, b: SavedApplication) => b.timestamp - a.timestamp);
      resolve(sorted);
    };
  });
};

export const deleteApplication = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) return reject('DB not initialized.');
    const transaction = db.transaction(APPLICATIONS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(APPLICATIONS_STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error('Delete application error:', request.error);
      reject('Error deleting application.');
    };
  });
};

// --- Error Log Service ---

export const addErrorLog = (log: Omit<ErrorLog, 'id'>): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.warn('DB not initialized, skipping log.');
      return resolve();
    }
    const newLog: ErrorLog = {
      ...log,
      id: self.crypto.randomUUID(),
    };
    const transaction = db.transaction(ERROR_LOGS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(ERROR_LOGS_STORE_NAME);
    const request = store.add(newLog);
    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error('Add log error:', request.error);
      reject('Error saving log.');
    };
  });
};

export const getAllErrorLogs = (): Promise<ErrorLog[]> => {
  return new Promise((resolve, reject) => {
    if (!db) return reject('DB not initialized.');
    const transaction = db.transaction(ERROR_LOGS_STORE_NAME, 'readonly');
    const store = transaction.objectStore(ERROR_LOGS_STORE_NAME);
    const request = store.getAll();

    request.onerror = () => {
      console.error('Get all logs error:', request.error);
      reject('Error fetching logs.');
    };

    request.onsuccess = () => {
      const sorted = request.result.sort((a: ErrorLog, b: ErrorLog) => b.timestamp - a.timestamp);
      resolve(sorted);
    };
  });
};

export const clearErrorLogs = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) return reject('DB not initialized.');
    const transaction = db.transaction(ERROR_LOGS_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(ERROR_LOGS_STORE_NAME);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error('Clear logs error:', request.error);
      reject('Error clearing logs.');
    };
  });
};
