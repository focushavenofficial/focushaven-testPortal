import { DataAPIClient } from '@datastax/astra-db-ts';

const astraToken = import.meta.env.VITE_ASTRA_DB_TOKEN;
const astraDbUrl = import.meta.env.VITE_ASTRA_DB_URL;

let db;

try {
  if (astraToken && astraDbUrl) {
    const client = new DataAPIClient(astraToken);
    db = client.db(astraDbUrl, { keyspace: 'default' });
    console.log('Astra DB client initialized successfully');
  } else {
    console.warn('Astra DB environment variables not configured. Using mock client.');
    // Create a mock client as fallback
    db = {
      collection: () => ({
        find: () => ({
          toArray: () => Promise.resolve([])
        }),
        insertOne: () => Promise.resolve({ insertedId: null }),
        findOne: () => Promise.resolve(null),
        updateOne: () => Promise.resolve({ modifiedCount: 0 }),
        deleteOne: () => Promise.resolve({ deletedCount: 0 })
      })
    };
  }
} catch (error) {
  console.error('Failed to initialize Astra DB client:', error);
  // Create a mock client as fallback
  db = {
    collection: () => ({
      find: () => ({
        toArray: () => Promise.resolve([])
      }),
      insertOne: () => Promise.resolve({ insertedId: null }),
      findOne: () => Promise.resolve(null),
      updateOne: () => Promise.resolve({ modifiedCount: 0 }),
      deleteOne: () => Promise.resolve({ deletedCount: 0 })
    })
  };
}

export { db };