import { test, expect } from "@playwright/test";

test("User sign-up and onboarding journey", async ({ page }) => {
  const randomEmail = `test-${Math.random().toString(36).substring(2, 9)}@iitb.ac.in`;
  const randomUsername = `user_${Math.random().toString(36).substring(2, 8)}`;

  // 1. Visit Landing Page
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Find your co-builders.");

  // 2. Click "Join Now"
  await page.click("text=Join Now");
  await expect(page).toHaveURL("/sign-up");

  // 3. Fill Sign-Up details
  await page.fill('input[name="email"]', randomEmail);
  await page.fill('input[name="password"]', "password123");
  await page.click('button[type="submit"]');

  // 4. Verify redirected to Onboarding Step 1
  await page.waitForURL("/onboarding");
  await expect(page.locator("h2")).toContainText("Personal Profile");

  // 5. Complete Step 1: Personal Info
  await page.fill('input[placeholder="Alex Chen"]', "Test Student");
  await page.fill('input[placeholder="aaravm"]', randomUsername);
  await page.fill('input[placeholder="Bengaluru, Karnataka"]', "Bengaluru, Karnataka");
  await page.fill('textarea[placeholder*="Tell us about your background"]', "Hi, I am a test student. I like to co-build products and explore web tech stacks.");
  await page.click("text=Continue to College Details");

  // 6. Complete Step 2: Academics
  await page.waitForTimeout(200); // Wait for transition
  await expect(page.locator("h2")).toContainText("University & Academics");
  await page.fill('input[placeholder="BITS Pilani"]', "IIT Bombay");
  await page.fill('input[placeholder="Computer Science"]', "Computer Science");
  await page.fill('textarea[placeholder*="Describe your co-founder goals"]', "Looking to co-build side projects in web dev and AI.");
  await page.click("text=Continue");

  // 7. Complete Step 3: Skills & Interests
  await page.waitForTimeout(200);
  await expect(page.locator("h2")).toContainText("Skills & Interests");
  
  // Add Offer Skill using Enter key
  await page.fill('input[placeholder="React, Figma, Python"]', "React");
  await page.press('input[placeholder="React, Figma, Python"]', "Enter");
  
  // Add Learn Skill using Enter key
  await page.fill('input[placeholder="Rust, Docker, UI/UX"]', "Docker");
  await page.press('input[placeholder="Rust, Docker, UI/UX"]', "Enter");

  await page.click("text=Continue");

  // 8. Complete Step 4: Social Links
  await page.waitForTimeout(200);
  await expect(page.locator("h2")).toContainText("Social & Portfolio Links");
  await page.fill('input[placeholder="https://github.com/username"]', "https://github.com/teststudent");
  await page.click("text=Complete Profile");

  // 9. Verify redirected to Dashboard
  await page.waitForURL("/dashboard");
  await expect(page.locator("h1")).toContainText("Hey, Test!");
});
