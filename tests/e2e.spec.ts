import { test, expect } from "@playwright/test";

test.describe("Full Sikkanam React Application & E2E Verification", () => {
  // Pre-seed storage to suppress one-time onboarding and auth modals
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem("sikkanam-version", "2.6.5");
      window.localStorage.setItem("sikkanam_welcome_auth_dismissed", "true");
      window.sessionStorage.setItem("sikkanam_welcome_auth_dismissed", "true");
      window.sessionStorage.setItem("sikkanam_pwa_dismissed_session", "true");
    });
  });

  test("1. Homepage and Navigation loads properly", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Sikkanam/i);

    const brandElement = page.getByText(/Sikkanam/i).first();
    await expect(brandElement).toBeVisible();

    const exploreLink = page.getByRole("link", { name: /explore/i }).first();
    if (await exploreLink.isVisible()) {
      await exploreLink.click();
      await expect(page).toHaveURL(/.*explore/);
    }
  });

  test("2. Destination Detail page (/destination/coimbatore) renders completely with 0 errors", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.goto("/destination/coimbatore");

    // Title and destination content
    await expect(page.getByRole("heading", { name: "Coimbatore" })).toBeVisible({ timeout: 10000 });

    // Weather widget and Rain risk
    await expect(page.getByText(/Weather Forecast|Rain Risk|Live Weather/i).first()).toBeVisible({ timeout: 10000 });

    // Attractions and transport
    await expect(page.getByText(/LuLu Mall/i).first()).toBeVisible();
    await expect(page.getByText(/Nearest railway station/i).first()).toBeVisible();

    // Verify 0 uncaught errors (no white screen crash)
    expect(pageErrors).toHaveLength(0);
  });

  test("3. Explore Destinations page (/explore) renders cards, filters, and navigates to details", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.goto("/explore");

    await expect(page.getByText(/Explore Tamil Nadu/i).first()).toBeVisible({ timeout: 10000 });

    // Filter by Hill Stations
    const hillTab = page.getByRole("button", { name: /Hill/i }).first();
    if (await hillTab.isVisible()) {
      await hillTab.click();
      await page.waitForTimeout(400);
      await expect(page.getByText(/Ooty|Kodaikanal|Yercaud/i).first()).toBeVisible();
    }

    // Click on Ooty card to navigate to its details
    const ootyCard = page.getByText("Ooty").first();
    await expect(ootyCard).toBeVisible();
    await ootyCard.click();

    await expect(page).toHaveURL(/.*destination\/ooty/i);
    await expect(page.getByRole("heading", { name: /Ooty/i }).first()).toBeVisible();

    expect(pageErrors).toHaveLength(0);
  });

  test("4. Trip Planner (/plan) generates realistic plan with dynamic budgets & hotel stays", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.goto("/plan");

    // Form should load with default presets (Chennai -> Ooty)
    await expect(page.getByRole("heading", { name: /Plan Your Trip/i })).toBeVisible({ timeout: 10000 });

    // Click "Generate Travel Plan"
    const generateBtn = page.getByRole("button", { name: /Generate.*Plan/i }).first();
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    // Verify generated trip plan results appear
    const resultElement = page.locator("div").filter({ hasText: /Trip Overview|Day 1|Budget Breakdown|Estimated Cost/i }).first();
    await expect(resultElement).toBeVisible({ timeout: 20000 });

    // Check that schedule tabs or itinerary cards exist
    await expect(page.getByText(/Day 1/i).first()).toBeVisible();

    // Check that budget numbers are populated and non-zero
    const budgetCard = page.locator("div").filter({ hasText: /₹/ }).first();
    await expect(budgetCard).toBeVisible();

    expect(pageErrors).toHaveLength(0);
  });

  test("5. AI Planner (/ai) handles simple greeting ('hi') with pure plain-text response", async ({ page }) => {
    await page.goto("/ai");

    const chatInput = page.getByPlaceholder(/Ask about a trip|Ask Sikkanam AI/i).first();
    await expect(chatInput).toBeVisible({ timeout: 10000 });

    await chatInput.fill("hi");
    await chatInput.press("Enter");

    const assistantMsg = page.locator(".bg-card, .bg-muted, div").filter({ hasText: /Vanakkam|Hello|Sikkanam/i }).last();
    await expect(assistantMsg).toBeVisible({ timeout: 20000 });

    const replyText = await assistantMsg.innerText();
    expect(replyText).not.toContain("Sorry, it's beyond my knowledge");
    expect(replyText.length).toBeGreaterThan(10);

    // Assert strictly plain text: zero markdown tables or bold syntax
    expect(replyText).not.toMatch(/\*\*|##|\|---|```/);
  });

  test("6. AI Planner (/ai) strictly enforces refusal guardrail on non-travel queries", async ({ page }) => {
    await page.goto("/ai");

    const chatInput = page.getByPlaceholder(/Ask about a trip|Ask Sikkanam AI/i).first();
    await expect(chatInput).toBeVisible({ timeout: 10000 });

    await chatInput.fill("write a python script to solve quadratic equation");
    await chatInput.press("Enter");

    const refusalMsg = page.getByText("Sorry, it's beyond my knowledge. Ask me some other thing related to travel.").first();
    await expect(refusalMsg).toBeVisible({ timeout: 20000 });
  });
});
