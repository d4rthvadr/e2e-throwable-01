import { v4 as uuid } from "uuid";
import { execute, queryRows } from "./database";
import type { Task } from "../types/models";

type TaskRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  completed: number;
  created_at: number;
  updated_at: number;
};

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    completed: Boolean(row.completed),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

export async function listTasksForUser(userId: string): Promise<Task[]> {
  const rows = await queryRows<TaskRow>(
    `SELECT id, user_id, title, description, completed, created_at, updated_at
     FROM tasks
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId],
  );

  return rows.map(mapTask);
}

export async function createTaskForUser(
  userId: string,
  title: string,
  description: string,
): Promise<void> {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    throw new Error("Task title is required.");
  }

  const now = Date.now();
  await execute(
    `INSERT INTO tasks (id, user_id, title, description, completed, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [uuid(), userId, trimmedTitle, description.trim(), 0, now, now],
  );
}

export async function updateTaskForUser(
  userId: string,
  taskId: string,
  title: string,
  description: string,
): Promise<void> {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    throw new Error("Task title is required.");
  }

  await execute(
    `UPDATE tasks
     SET title = ?, description = ?, updated_at = ?
     WHERE id = ? AND user_id = ?`,
    [trimmedTitle, description.trim(), Date.now(), taskId, userId],
  );
}

export async function toggleTaskForUser(
  userId: string,
  taskId: string,
  completed: boolean,
): Promise<void> {
  await execute(
    `UPDATE tasks
     SET completed = ?, updated_at = ?
     WHERE id = ? AND user_id = ?`,
    [completed ? 1 : 0, Date.now(), taskId, userId],
  );
}

export async function deleteTaskForUser(
  userId: string,
  taskId: string,
): Promise<void> {
  await execute("DELETE FROM tasks WHERE id = ? AND user_id = ?", [
    taskId,
    userId,
  ]);
}
