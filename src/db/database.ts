import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { loadDatabaseBytes, saveDatabaseBytes } from "./storage";

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  completed INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  theme TEXT NOT NULL DEFAULT 'light',
  notifications_enabled INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
`;

let sqlEnginePromise: Promise<SqlJsStatic> | null = null;
let dbPromise: Promise<Database> | null = null;

function getSqlEngine(): Promise<SqlJsStatic> {
  if (!sqlEnginePromise) {
    sqlEnginePromise = initSqlJs({
      locateFile: () => wasmUrl,
    });
  }

  return sqlEnginePromise;
}

async function bootstrapDatabase(): Promise<Database> {
  const SQL = await getSqlEngine();
  const bytes = await loadDatabaseBytes();
  const db = bytes ? new SQL.Database(bytes) : new SQL.Database();

  db.run("PRAGMA foreign_keys = ON;");
  db.run(SCHEMA_SQL);
  await persistDatabase(db);

  return db;
}

export async function getDatabase(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = bootstrapDatabase();
  }

  return dbPromise;
}

export async function persistDatabase(db?: Database): Promise<void> {
  const activeDb = db ?? (await getDatabase());
  const bytes = activeDb.export();
  await saveDatabaseBytes(bytes);
}

export async function queryRows<T>(
  sql: string,
  params: (string | number)[] = [],
): Promise<T[]> {
  const db = await getDatabase();
  const statement = db.prepare(sql);
  statement.bind(params);

  const rows: T[] = [];
  while (statement.step()) {
    rows.push(statement.getAsObject() as T);
  }

  statement.free();
  return rows;
}

export async function execute(
  sql: string,
  params: (string | number)[] = [],
): Promise<void> {
  const db = await getDatabase();
  db.run(sql, params);
  await persistDatabase(db);
}
