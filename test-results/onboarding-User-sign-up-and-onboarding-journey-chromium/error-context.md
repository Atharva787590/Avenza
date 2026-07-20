# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: onboarding.spec.ts >> User sign-up and onboarding journey
- Location: tests/onboarding.spec.ts:3:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test("User sign-up and onboarding journey", async ({ page }) => {
  4  |   const randomEmail = `test-${Math.random().toString(36).substring(2, 9)}@iitb.ac.in`;
  5  |   const randomUsername = `user_${Math.random().toString(36).substring(2, 8)}`;
  6  | 
  7  |   // 1. Visit Landing Page
> 8  |   await page.goto("/");
     |              ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  9  |   await expect(page.locator("h1")).toContainText("Find your co-builders.");
  10 | 
  11 |   // 2. Click "Join Now"
  12 |   await page.click("text=Join Now");
  13 |   await expect(page).toHaveURL("/sign-up");
  14 | 
  15 |   // 3. Fill Sign-Up details
  16 |   await page.fill('input[name="email"]', randomEmail);
  17 |   await page.fill('input[name="password"]', "password123");
  18 |   await page.click('button[type="submit"]');
  19 | 
  20 |   // 4. Verify redirected to Onboarding Step 1
  21 |   await page.waitForURL("/onboarding");
  22 |   await expect(page.locator("h2")).toContainText("Personal Profile");
  23 | 
  24 |   // 5. Complete Step 1: Personal Info
  25 |   await page.fill('input[placeholder="Alex Chen"]', "Test Student");
  26 |   await page.fill('input[placeholder="aaravm"]', randomUsername);
  27 |   await page.fill('input[placeholder="Bengaluru, Karnataka"]', "Bengaluru, Karnataka");
  28 |   await page.fill('textarea[placeholder*="Tell us about your background"]', "Hi, I am a test student. I like to co-build products and explore web tech stacks.");
  29 |   await page.click("text=Continue to College Details");
  30 | 
  31 |   // 6. Complete Step 2: Academics
  32 |   await page.waitForTimeout(200); // Wait for transition
  33 |   await expect(page.locator("h2")).toContainText("University & Academics");
  34 |   await page.fill('input[placeholder="BITS Pilani"]', "IIT Bombay");
  35 |   await page.fill('input[placeholder="Computer Science"]', "Computer Science");
  36 |   await page.fill('textarea[placeholder*="Describe your co-founder goals"]', "Looking to co-build side projects in web dev and AI.");
  37 |   await page.click("text=Continue");
  38 | 
  39 |   // 7. Complete Step 3: Skills & Interests
  40 |   await page.waitForTimeout(200);
  41 |   await expect(page.locator("h2")).toContainText("Skills & Interests");
  42 |   
  43 |   // Add Offer Skill using Enter key
  44 |   await page.fill('input[placeholder="React, Figma, Python"]', "React");
  45 |   await page.press('input[placeholder="React, Figma, Python"]', "Enter");
  46 |   
  47 |   // Add Learn Skill using Enter key
  48 |   await page.fill('input[placeholder="Rust, Docker, UI/UX"]', "Docker");
  49 |   await page.press('input[placeholder="Rust, Docker, UI/UX"]', "Enter");
  50 | 
  51 |   await page.click("text=Continue");
  52 | 
  53 |   // 8. Complete Step 4: Social Links
  54 |   await page.waitForTimeout(200);
  55 |   await expect(page.locator("h2")).toContainText("Social & Portfolio Links");
  56 |   await page.fill('input[placeholder="https://github.com/username"]', "https://github.com/teststudent");
  57 |   await page.click("text=Complete Profile");
  58 | 
  59 |   // 9. Verify redirected to Dashboard
  60 |   await page.waitForURL("/dashboard");
  61 |   await expect(page.locator("h1")).toContainText("Hey, Test!");
  62 | });
  63 | 
```