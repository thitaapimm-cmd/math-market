# Student Entry Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage student picker with a centered Math Market entry control and add a dedicated student selection page with preset-avatar student creation.

**Architecture:** Keep `/` as a presentational server component and move all local-storage interaction into the client-rendered `/student/select` page. Extend the existing storage API with an append-only `addStudent` method and keep the existing pre-test/path routing decision unchanged.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, browser `localStorage`, Next.js Google Fonts, Vitest, jsdom, Testing Library.

## Global Constraints

- The landing page contains no student selector or “Start learning” button.
- The Math Market bucket/cart entry control is centered and navigates to `/student/select`.
- Teacher Mode remains linked to `/teacher/dashboard` and is fixed at the bottom-left.
- Student creation accepts exactly one required name and one required preset avatar cropped from the user-provided portrait sheet; there is no image upload.
- New students are persisted locally and remain visible on `/student/select` after creation.
- Prompt weights: 400, 500, 600, 700, 800. Sarabun weights: 400, 600, 700.
- Existing students route to `/student/pretest` without a pre-test and `/student/path` after a pre-test.

---

### Task 1: Test Harness and Student Persistence

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/lib/storage.ts`
- Create: `src/lib/storage.test.ts`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`

**Interfaces:**
- Consumes: existing `Student` type and `getStorageData<T>(key, defaultValue)` helper.
- Produces: `api.addStudent(input: Pick<Student, "name" | "avatar_url">): Student`.

- [ ] **Step 1: Install and configure the test harness**

Run:

```bash
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Add scripts to `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

Create `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 2: Write the failing persistence test**

Create `src/lib/storage.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { api } from "@/lib/storage";

describe("api.addStudent", () => {
  beforeEach(() => localStorage.clear());

  it("appends a student without removing existing students", () => {
    const existing = api.getStudents();
    const created = api.addStudent({ name: "น้องมะลิ", avatar_url: "🐰" });

    expect(created.name).toBe("น้องมะลิ");
    expect(created.avatar_url).toBe("🐰");
    expect(created.id).toMatch(/^std_/);
    expect(api.getStudents()).toEqual([...existing, created]);
  });
});
```

- [ ] **Step 3: Run the test and verify the expected failure**

Run: `npm test -- src/lib/storage.test.ts`

Expected: FAIL because `api.addStudent` does not exist.

- [ ] **Step 4: Add the minimal append-only storage method**

Add to the `api` object in `src/lib/storage.ts`:

```ts
addStudent: (input: Pick<Student, "name" | "avatar_url">): Student => {
  const students = getStorageData("students", INITIAL_STUDENTS);
  const uniquePart = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const student: Student = {
    id: `std_${uniquePart}`,
    student_code: `NEW-${Date.now()}`,
    name: input.name.trim(),
    classroom: "",
    avatar_url: input.avatar_url,
    created_at: new Date().toISOString(),
  };
  setStorageData("students", [...students, student]);
  return student;
},
```

- [ ] **Step 5: Run the persistence test**

Run: `npm test -- src/lib/storage.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the persistence slice**

```bash
git add package.json package-lock.json vitest.config.ts vitest.setup.ts src/lib/storage.ts src/lib/storage.test.ts
git commit -m "feat: add student persistence API"
```

---

### Task 2: Global Typography and Simplified Landing Page

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx`
- Create: `src/app/page.test.tsx`

**Interfaces:**
- Consumes: `/student/select` and `/teacher/dashboard` route contracts.
- Produces: CSS variables `--font-prompt` and `--font-sarabun`; accessible links named “เข้าสู่ Math Market” and “สำหรับคุณครู (Teacher Mode)”.

- [ ] **Step 1: Write the failing landing-page test**

Create `src/app/page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WelcomePage from "./page";

describe("WelcomePage", () => {
  it("shows only the primary market entry and teacher access", () => {
    render(<WelcomePage />);

    expect(screen.getByRole("link", { name: "เข้าสู่ Math Market" })).toHaveAttribute(
      "href",
      "/student/select",
    );
    expect(
      screen.getByRole("link", { name: /สำหรับคุณครู/ }),
    ).toHaveAttribute("href", "/teacher/dashboard");
    expect(screen.queryByText("เริ่มเรียน")).not.toBeInTheDocument();
    expect(screen.queryByText("น้องตะวัน")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the landing-page test and verify the expected failure**

Run: `npm test -- src/app/page.test.tsx`

Expected: FAIL because the current page still renders students and has no `/student/select` link.

- [ ] **Step 3: Configure Prompt and Sarabun through `next/font/google`**

Replace the Geist setup in `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Prompt, Sarabun } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-prompt",
  display: "swap",
});

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-sarabun",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Math Market",
  description: "เรียนรู้เรื่องเงินผ่านการซื้อของ",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body className={`${prompt.variable} ${sarabun.variable}`}>{children}</body>
    </html>
  );
}
```

Set the global font rules in `src/app/globals.css`:

```css
body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-prompt), Arial, sans-serif;
}

.font-reading {
  font-family: var(--font-sarabun), Arial, sans-serif;
}
```

- [ ] **Step 4: Replace the homepage with the centered market entry**

Make `src/app/page.tsx` a server component using `Link`, a centered responsive market card/link with `aria-label="เข้าสู่ Math Market"`, and a fixed bottom-left Teacher Mode link. Remove state, effects, speech, student storage, and start-routing logic from the homepage.

- [ ] **Step 5: Run the landing-page test**

Run: `npm test -- src/app/page.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit the landing-page slice**

```bash
git add src/app/layout.tsx src/app/globals.css src/app/page.tsx src/app/page.test.tsx
git commit -m "feat: simplify Math Market landing page"
```

---

### Task 3: Student Selection and Preset-Avatar Creation

**Files:**
- Create: `src/app/student/select/page.tsx`
- Create: `src/app/student/select/page.test.tsx`
- Create: `src/components/common/StudentAvatar.tsx`
- Create: `public/avatars/student-01.png` through `public/avatars/student-10.png`
- Modify: `src/app/student/path/page.tsx`
- Modify: `src/app/teacher/dashboard/page.tsx`

**Interfaces:**
- Consumes: `api.getStudents()`, `api.addStudent(input)`, `api.setCurrentStudent(student)`, `api.getAssessments(studentId)`, `speakThai(text)`, `playSoundEffect("click")`, and `router.push(path)`.
- Produces: the `/student/select` route and its two views, “เลือกนักเรียน” and “สร้างนักเรียนใหม่”; ten portrait asset paths; a shared avatar renderer that supports both legacy emoji and image paths.

- [ ] **Step 1: Write failing tests for choosing and creating students**

Mock `next/navigation`, `@/lib/storage`, and `@/lib/speech`. Render the page and verify:

```tsx
it("routes an existing student to the pre-test when no pre-test exists", async () => {
  render(<StudentSelectPage />);
  await user.click(screen.getByRole("button", { name: /เลือกนักเรียน/ }));
  await user.click(screen.getByRole("button", { name: /น้องตะวัน/ }));
  expect(mockSetCurrentStudent).toHaveBeenCalledWith(existingStudent);
  expect(mockPush).toHaveBeenCalledWith("/student/pretest");
});

it("creates a student from a name and preset avatar", async () => {
  render(<StudentSelectPage />);
  await user.click(screen.getByRole("button", { name: /สร้างนักเรียนใหม่/ }));
  await user.type(screen.getByLabelText("ชื่อนักเรียน"), "น้องมะลิ");
  await user.click(screen.getByRole("radio", { name: "อวตาร 1" }));
  await user.click(screen.getByRole("button", { name: "สร้างนักเรียน" }));
  expect(mockAddStudent).toHaveBeenCalledWith({ name: "น้องมะลิ", avatar_url: "/avatars/student-01.png" });
  expect(screen.getByText("น้องมะลิ")).toBeInTheDocument();
});
```

Also verify the create button is disabled until both required values are present and that closing the modal does not call `api.addStudent`.

- [ ] **Step 2: Run the selection-page tests and verify the expected failure**

Run: `npm test -- src/app/student/select/page.test.tsx`

Expected: FAIL because `/student/select` does not exist.

- [ ] **Step 3: Implement the two-choice student entry screen**

Create a client component that loads students in `useEffect`, displays two prominent action buttons, and conditionally renders the existing student grid. Use a shared `continueAsStudent(student)` handler to set the current student and route according to the existing pre-test assessment check.

- [ ] **Step 4: Implement the accessible creation modal**

Use `role="dialog"`, `aria-modal="true"`, a labelled heading, an explicit close button, a required name input, and ten preset portrait radio choices sourced from the supplied 5-by-2 image sheet. Crop the exact supplied portraits into project-local PNGs; do not regenerate, redraw, or stylistically alter them. Define their paths as:

```ts
const PRESET_AVATARS = [
  { value: "/avatars/student-01.png", label: "อวตาร 1" },
  { value: "/avatars/student-02.png", label: "อวตาร 2" },
  { value: "/avatars/student-03.png", label: "อวตาร 3" },
  { value: "/avatars/student-04.png", label: "อวตาร 4" },
  { value: "/avatars/student-05.png", label: "อวตาร 5" },
  { value: "/avatars/student-06.png", label: "อวตาร 6" },
  { value: "/avatars/student-07.png", label: "อวตาร 7" },
  { value: "/avatars/student-08.png", label: "อวตาร 8" },
  { value: "/avatars/student-09.png", label: "อวตาร 9" },
  { value: "/avatars/student-10.png", label: "อวตาร 10" },
] as const;
```

Render preset and saved avatars with `StudentAvatar`, using `next/image` for values beginning with `/` and text for legacy emoji values. Update the path and teacher pages to use the same renderer. On valid submit, call `api.addStudent`, append the returned student to component state, select it visually, close the modal, and keep the user on `/student/select`.

- [ ] **Step 5: Run the student entry tests**

Run: `npm test -- src/app/student/select/page.test.tsx`

Expected: PASS.

- [ ] **Step 6: Run all automated verification**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all tests pass, ESLint exits successfully, and Next.js completes a production build.

- [ ] **Step 7: Verify the live flow in the browser**

At `http://localhost:3000/`, verify the student picker is absent, the centered Math Market control opens `/student/select`, Teacher Mode is bottom-left, an existing student follows the pre-test/path rule, and a newly created preset-avatar student appears immediately. Repeat visual checks at desktop and narrow mobile widths.

- [ ] **Step 8: Commit the student entry flow**

```bash
git add src/app/student/select/page.tsx src/app/student/select/page.test.tsx src/components/common/StudentAvatar.tsx public/avatars src/app/student/path/page.tsx src/app/teacher/dashboard/page.tsx
git commit -m "feat: add student selection and creation flow"
```

---

### Task 4: Existing React Hook Lint Cleanup

**Files:**
- Modify: `src/app/student/level/1/page.tsx`
- Modify: `src/app/student/level/2/page.tsx`
- Modify: `src/app/student/level/3/page.tsx`
- Modify: `src/app/student/level/4/page.tsx`
- Modify: `src/app/student/level/5/page.tsx`
- Modify: `src/app/student/path/page.tsx`
- Modify: `src/app/student/pretest/page.tsx`
- Modify: `src/app/teacher/dashboard/page.tsx`

**Interfaces:**
- Consumes: existing storage reads, router redirects, and speech side effects in each page.
- Produces: the same user-visible behavior without synchronous state writes directly inside effects, plus removal of the reported unused imports/parameters.

- [ ] **Step 1: Preserve the baseline failure as the regression check**

Run: `npm run lint`

Expected: FAIL with `react-hooks/set-state-in-effect` errors on the listed pages and unused-variable warnings in level 3 and the teacher dashboard.

- [ ] **Step 2: Trace each effect’s responsibilities before editing**

For each reported page, separate initial local-storage reads from true synchronization side effects. Move stable initial reads to lazy state initializers where rendering stays hydration-safe, or defer client-only initialization behind an explicit mounted state when server and client snapshots can differ. Keep routing and speech behavior in effects. Remove only the reported unused `idx` parameter and `Store` import.

- [ ] **Step 3: Apply the minimal lint-safe changes**

Do not redesign learning-level behavior, persistence, routing, scoring, or teacher reporting. Each page must retain the same initial values and redirects while eliminating direct synchronous state setter calls from effect bodies.

- [ ] **Step 4: Verify the lint fix**

Run: `npm run lint`

Expected: PASS with no warnings or errors.

- [ ] **Step 5: Run the full feature verification**

Run:

```bash
npm test
npm run build
```

Expected: tests pass and the production build completes successfully.

- [ ] **Step 6: Leave changes uncommitted for user review**

Do not stage or commit any files. Report the modified files and verification output.
