import { expect, test } from "@playwright/test";

test("login and signup with persistence", async ({ page }) => {
  const username = `autouser_${Date.now()}`;
  const password = "test1234";

  await page.goto("/");

  await expect(page.getByTestId("auth-page")).toBeVisible();
  await expect(page.getByTestId("dashboard-page")).toHaveCount(0);

  await page.getByTestId("mode-signup").click();
  await page.getByTestId("input-username").fill(username);
  await page.getByTestId("input-password").fill(password);
  await page.getByTestId("submit-auth").click();

  await expect(page.getByTestId("dashboard-page")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: `${username}'s dashboard` }),
  ).toBeVisible();
  await expect(page.getByTestId("create-task-panel")).toBeVisible();

  await page.getByTestId("logout-button").click();
  await expect(page.getByTestId("auth-page")).toBeVisible();
  await expect(page.getByTestId("dashboard-page")).toHaveCount(0);

  await page.getByTestId("input-username").fill(username);
  await page.getByTestId("input-password").fill(password);
  await page.getByTestId("submit-auth").click();

  await expect(page.getByTestId("dashboard-page")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: `${username}'s dashboard` }),
  ).toBeVisible();

  await page.reload();
  await expect(page.getByTestId("dashboard-page")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: `${username}'s dashboard` }),
  ).toBeVisible();
});
