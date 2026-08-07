import { v4 as uuid } from "uuid";
import { hashPassword } from "../utils/crypto";
import { execute, queryRows } from "./database";
import type { User, UserRecord } from "../types/models";

function toUser(row: UserRecord): User {
  return {
    id: row.id,
    username: row.username,
    createdAt: Number(row.created_at),
  };
}

export async function findUserById(userId: string): Promise<User | null> {
  const rows = await queryRows<UserRecord>(
    "SELECT id, username, password_hash, created_at FROM users WHERE id = ? LIMIT 1",
    [userId],
  );
  if (!rows[0]) {
    return null;
  }
  return toUser(rows[0]);
}

export async function createUser(
  username: string,
  password: string,
): Promise<User> {
  const normalized = username.trim().toLowerCase();
  if (!normalized) {
    throw new Error("Username is required.");
  }
  if (password.trim().length < 4) {
    throw new Error("Password must be at least 4 characters.");
  }

  const existing = await queryRows<{ id: string }>(
    "SELECT id FROM users WHERE username = ? LIMIT 1",
    [normalized],
  );
  if (existing.length > 0) {
    throw new Error("Username is already in use.");
  }

  const userId = uuid();
  const now = Date.now();
  const passwordHash = await hashPassword(password);

  await execute(
    "INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)",
    [userId, normalized, passwordHash, now],
  );

  await execute(
    "INSERT INTO user_preferences (id, user_id, theme, notifications_enabled, created_at) VALUES (?, ?, ?, ?, ?)",
    [uuid(), userId, "light", 1, now],
  );

  return {
    id: userId,
    username: normalized,
    createdAt: now,
  };
}

export async function loginUser(
  username: string,
  password: string,
): Promise<User> {
  const normalized = username.trim().toLowerCase();
  const rows = await queryRows<UserRecord>(
    "SELECT id, username, password_hash, created_at FROM users WHERE username = ? LIMIT 1",
    [normalized],
  );

  const row = rows[0];
  if (!row) {
    throw new Error("Invalid username or password.");
  }

  const passwordHash = await hashPassword(password);
  if (passwordHash !== row.password_hash) {
    throw new Error("Invalid username or password.");
  }

  return toUser(row);
}
