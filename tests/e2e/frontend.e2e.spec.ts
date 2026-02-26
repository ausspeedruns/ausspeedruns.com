import { test, expect } from "@playwright/test";

test.describe("Frontend", () => {
	// let page: Page;

	// test.beforeAll(async ({ browser }, _testInfo) => {
	// 	const context = await browser.newContext();
	// 	// page = await context.newPage();
	// });

	test("can go on homepage", async ({ page }) => {
		await page.goto("http://localhost:3000");

		await expect(page).toHaveTitle(/Payload Website Template/);

		const heading = page.locator("h1").first();

		await expect(heading).toHaveText("Payload Website Template");
	});
});
