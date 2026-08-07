import { createUser, loginUser } from "../db/usersRepo";
import { createTaskForUser, listTasksForUser } from "../db/tasksRepo";

export const DEMO_USERNAME = "demo";
export const DEMO_PASSWORD = "demo1234";

export async function seedDemoAccount(): Promise<void> {
  let userId: string;

  try {
    const user = await createUser(DEMO_USERNAME, DEMO_PASSWORD);
    userId = user.id;
  } catch {
    const existingUser = await loginUser(DEMO_USERNAME, DEMO_PASSWORD);
    userId = existingUser.id;
  }

  const tasks = await listTasksForUser(userId);
  if (tasks.length > 0) {
    return;
  }

  await createTaskForUser(
    userId,
    "Write first task",
    "Create a todo and confirm it appears on the dashboard.",
  );
  await createTaskForUser(
    userId,
    "Toggle completion",
    "Mark this task complete and then incomplete.",
  );
  await createTaskForUser(
    userId,
    "Edit and delete",
    "Rename this task, then remove it to validate CRUD flow.",
  );
}
