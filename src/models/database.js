import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

const getDBPath = () => {
  const dbPath = process.env.DB_PATH || './database/financial_fund.db';
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dbPath;
};

export const initializeDatabase = async () => {
  try {
    if (db) return db;

    const dbPath = getDBPath();
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Database connected successfully');
      }
    });

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
    db.run('PRAGMA journal_mode = WAL');
    db.run('PRAGMA synchronous = NORMAL');
    db.run('PRAGMA cache_size = 10000');
    db.run('PRAGMA temp_store = MEMORY');

    // Initialize schema
    await initializeSchema();

    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

const initializeSchema = async () => {
  return new Promise((resolve, reject) => {
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    let completed = 0;
    const total = statements.length;

    statements.forEach(statement => {
      db.run(statement, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('Error executing schema statement:', err);
        }
        completed++;
        if (completed === total) {
          resolve();
        }
      });
    });
  });
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return db;
};

export const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) reject(err);
        else {
          console.log('Database connection closed');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
};

export const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!db) reject(new Error('Database not initialized'));
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!db) reject(new Error('Database not initialized'));
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!db) reject(new Error('Database not initialized'));
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};
