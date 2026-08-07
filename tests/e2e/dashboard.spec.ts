import { expect, test } from "@playwright/test";

test("dashboard CRUD operations", async ({ page }) => {
  const username = `cruduser_${Date.now()}`;
  const password = "test1234";
  const taskTitle = "Write Playwright tests";
  const updatedTaskTitle = "Write Playwright test coverage";

  await page.goto("/");

  await page.getByTestId("mode-signup").click();
  await page.getByTestId("input-username").fill(username);
  await page.getByTestId("input-password").fill(password);
  await page.getByTestId("submit-auth").click();

  await expect(page.getByTestId("dashboard-page")).toBeVisible();

  await page.getByTestId("input-task-title").fill(taskTitle);
  await page
    .getByTestId("input-task-description")
    .fill("Create, complete, edit, and delete the task.");
  await page.getByTestId("create-task-button").click();

  const taskItem = page.getByTestId("tasks-list").getByRole("listitem").first();
  const taskToggle = taskItem.locator('[data-testid^="task-toggle-"]');
  const taskEditButton = taskItem.locator('[data-testid^="task-edit-"]');
  const taskEditTitle = taskItem.locator('[data-testid^="task-edit-title-"]');
  const taskEditDescription = taskItem.locator(
    '[data-testid^="task-edit-description-"]',
  );
  const taskSaveButton = taskItem.locator('[data-testid^="task-save-"]');
  const taskDeleteButton = taskItem.locator('[data-testid^="task-delete-"]');

  await expect(taskItem).toContainText(taskTitle);
  await expect(taskItem).toContainText(
    "Create, complete, edit, and delete the task.",
  );

  await taskToggle.click();
  await expect(taskToggle).toBeChecked();

  await taskEditButton.click();
  await taskEditTitle.fill(updatedTaskTitle);
  await taskEditDescription.fill("Updated description for the task.");
  await taskSaveButton.click();

  await expect(taskItem).toContainText(updatedTaskTitle);
  await expect(taskItem).toContainText("Updated description for the task.");

  await taskDeleteButton.click();
  await expect(page.getByTestId("tasks-empty")).toBeVisible();
});
