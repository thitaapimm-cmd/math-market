# Randomized Learning and Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver five randomized, spoken, measurable exercises in Pretest and Levels 1–5, flexible quantity-based money payment, and detailed teacher analytics.

**Architecture:** Add small pure utilities for randomization, timing, attempt normalization, assessment, and money quantities. Keep each learning page’s distinct UI, but make every page write the same backward-compatible attempt schema. Derive Dashboard summaries exclusively from stored assessments and attempts.

**Tech Stack:** Next.js App Router, React 19 client components, TypeScript, localStorage, Vitest, Testing Library, Tailwind CSS, existing Thai speech and celebration helpers.

## Global Constraints

- Persist only in the existing `math_market_*` localStorage namespace.
- Support denominations 1, 2, 5, 10, 20, 50, and 100 baht.
- Exactly five shuffled exercises per Pretest or Level session.
- Count a wrong answer only on confirmation/payment, never on selection.
- Display and speak the exact same canonical hint string after a wrong answer.
- Preserve compatibility with stored attempts that lack new optional fields.
- Do not add a dedicated “ฟัง” button; question speech is automatic.

---

### Task 1: Shared session randomization, timing, and analytics model

**Files:**
- Create: `src/lib/learningSession.ts`
- Create: `src/lib/learningSession.test.ts`
- Modify: `src/types/index.ts`
- Modify: `src/lib/storage.ts`
- Modify: `src/lib/storage.test.ts`

**Interfaces:**
- Produces: `shuffleQuestions<T>(items, random?)`, `secondsBetween(start, end)`, `normalizeAttempt(attempt)`, `getPreliminaryAssessment(score?)`.
- Produces optional-compatible `AttemptAnswer.prompt`, `first_try_correct`, `wrong_count`, `duration_seconds`, and `steps`; plus `Attempt.wrong_count`, `started_at`, and `completed_at`.

- [ ] **Step 1: Write failing utility and storage compatibility tests**

```ts
it("shuffles a copy without mutating the source", () => {
  const source = [1, 2, 3, 4, 5];
  expect(shuffleQuestions(source, () => 0)).toEqual([2, 3, 4, 5, 1]);
  expect(source).toEqual([1, 2, 3, 4, 5]);
});

it("normalizes legacy attempts for analytics", () => {
  expect(normalizeAttempt(legacyAttempt)).toMatchObject({
    wrong_count: 0,
    answers: [],
  });
});

it.each([[5, "พร้อมเรียนต่อ"], [3, "กำลังพัฒนา"], [1, "ควรฝึกเพิ่มเติม"], [undefined, "รอประเมิน"]])(
  "maps score %s to %s", (score, label) => {
    expect(getPreliminaryAssessment(score).label).toBe(label);
  },
);
```

- [ ] **Step 2: Run tests and verify the expected missing-export failures**

Run: `npm test -- --run src/lib/learningSession.test.ts src/lib/storage.test.ts`

Expected: FAIL because `learningSession.ts` and the new fields do not exist.

- [ ] **Step 3: Implement pure helpers and backward-compatible types**

```ts
export function shuffleQuestions<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export const secondsBetween = (start: number, end: number) =>
  Math.max(0, Math.round((end - start) / 1000));

export const getPreliminaryAssessment = (score?: number) =>
  score === undefined
    ? { label: "รอประเมิน", tone: "slate" as const }
    : score >= 4
      ? { label: "พร้อมเรียนต่อ", tone: "emerald" as const }
      : score >= 2
        ? { label: "กำลังพัฒนา", tone: "amber" as const }
        : { label: "ควรฝึกเพิ่มเติม", tone: "rose" as const };
```

Make the added analytics fields optional at the type boundary, and normalize them to zero/empty values only when presenting analytics. Preserve `api.recordAttempt` and `api.getAttempts` signatures.

- [ ] **Step 4: Run focused tests and confirm they pass**

Run: `npm test -- --run src/lib/learningSession.test.ts src/lib/storage.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the shared session foundation**

```bash
git add src/lib/learningSession.ts src/lib/learningSession.test.ts src/types/index.ts src/lib/storage.ts src/lib/storage.test.ts
git commit -m "feat: add learning session analytics model"
```

---

### Task 2: Quantity-based money composition

**Files:**
- Modify: `src/lib/money.ts`
- Modify: `src/lib/money.test.ts`
- Create: `src/components/common/MoneyQuantitySelector.tsx`
- Create: `src/components/common/MoneyQuantitySelector.test.tsx`

**Interfaces:**
- Produces: `MoneyQuantities`, `incrementMoney`, `decrementMoney`, `expandMoneyQuantities`, `sumMoneyQuantities`, `formatMoneyEquation`.
- Produces component props `{ values, quantities, onChange, disabled? }`.

- [ ] **Step 1: Write failing money utility tests**

```ts
it("supports repeated and mixed exact-payment combinations", () => {
  expect(sumMoneyQuantities({ 10: 3 })).toBe(30);
  expect(sumMoneyQuantities({ 20: 1, 10: 1 })).toBe(30);
  expect(sumMoneyQuantities({ 10: 2, 5: 2 })).toBe(30);
});

it("increments, decrements, and removes zero quantities", () => {
  expect(incrementMoney({ 10: 1 }, 10)).toEqual({ 10: 2 });
  expect(decrementMoney({ 10: 1 }, 10)).toEqual({});
});
```

- [ ] **Step 2: Run the money tests and verify missing exports fail**

Run: `npm test -- --run src/lib/money.test.ts`

Expected: FAIL for the quantity helper imports.

- [ ] **Step 3: Implement immutable quantity helpers**

```ts
export type MoneyQuantities = Partial<Record<MoneyValue, number>>;

export const incrementMoney = (current: MoneyQuantities, value: MoneyValue) => ({
  ...current,
  [value]: (current[value] ?? 0) + 1,
});

export const decrementMoney = (current: MoneyQuantities, value: MoneyValue) => {
  const next = { ...current };
  const quantity = next[value] ?? 0;
  if (quantity <= 1) delete next[value];
  else next[value] = quantity - 1;
  return next;
};
```

Add deterministic expansion in denomination display order and format `10 × 3 = 30 บาท` without creating duplicate DOM money cards.

- [ ] **Step 4: Write a failing selector interaction test**

```tsx
await user.click(screen.getByRole("button", { name: "เพิ่มเหรียญ 10 บาท" }));
await user.click(screen.getByRole("button", { name: "เพิ่มเหรียญ 10 บาท" }));
expect(screen.getByText("×2")).toBeInTheDocument();
await user.click(screen.getByRole("button", { name: "ลดเหรียญ 10 บาท" }));
expect(onChange).toHaveBeenLastCalledWith({ 10: 1 });
```

- [ ] **Step 5: Run the component test and verify the selector is missing**

Run: `npm test -- --run src/components/common/MoneyQuantitySelector.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 6: Implement the accessible selector**

Render one `MoneyCard` per denomination, a quantity badge when quantity exceeds zero, decrement controls for selected denominations, and a “ล้างเงิน” button. Call `speakThai(getMoneySpeech(value))` only from increment actions; selection itself does not submit an answer.

- [ ] **Step 7: Run all money tests and commit**

Run: `npm test -- --run src/lib/money.test.ts src/components/common/MoneyQuantitySelector.test.tsx src/components/common/MoneyCard.test.tsx`

Expected: PASS.

```bash
git add src/lib/money.ts src/lib/money.test.ts src/components/common/MoneyQuantitySelector.tsx src/components/common/MoneyQuantitySelector.test.tsx
git commit -m "feat: add quantity based money selector"
```

---

### Task 3: Pretest detailed baseline tracking and canonical hints

**Files:**
- Modify: `src/app/student/pretest/page.tsx`
- Modify: `src/app/student/pretest/page.test.tsx`

**Interfaces:**
- Consumes: session helpers and detailed `AttemptAnswer` fields from Task 1.
- Produces: Level 0 `pretest` attempt plus the existing assessment record.

- [ ] **Step 1: Extend the Pretest component test with failing behavior assertions**

```tsx
expect(mockSpeakThai).toHaveBeenCalledWith(expect.stringContaining(currentPrompt));
await chooseAndConfirmWrongAnswer();
expect(screen.getByRole("status")).toHaveTextContent(expectedHint);
expect(mockSpeakThai).toHaveBeenLastCalledWith(expectedHint);
```

Use fake timers and a mocked clock to finish five questions, then assert `recordAttempt` receives five answer rows, real elapsed seconds, and one wrong count per incorrect baseline answer.

- [ ] **Step 2: Run the Pretest test and verify it fails on exact hint/attempt data**

Run: `npm test -- --run src/app/student/pretest/page.test.tsx`

Expected: FAIL because questions have no canonical hint and Pretest does not record a detailed attempt.

- [ ] **Step 3: Add hints, shuffled session state, timer refs, and automatic prompt speech**

Initialize questions with `useState(() => shuffleQuestions(QUESTIONS).slice(0, 5))`. Speak from an effect keyed by `currentQ.id`. On confirmation, capture the final answer and elapsed seconds. When wrong, display and speak `currentQ.hint` exactly; advance after feedback without allowing correction.

- [ ] **Step 4: Persist assessment and detailed attempt after question five**

```ts
api.recordAttempt({
  student_id: student.id,
  level: 0,
  activity_type: "pretest",
  mode: "learning",
  score: finalScore,
  total_questions: 5,
  hint_count: finalWrongCount,
  wrong_count: finalWrongCount,
  duration_seconds: secondsBetween(sessionStartedAt.current, now),
  started_at: new Date(sessionStartedAt.current).toISOString(),
  completed_at: new Date(now).toISOString(),
  answers: finalAnswers,
});
```

- [ ] **Step 5: Run Pretest tests and commit**

Run: `npm test -- --run src/app/student/pretest/page.test.tsx src/lib/storage.test.ts`

Expected: PASS.

```bash
git add src/app/student/pretest/page.tsx src/app/student/pretest/page.test.tsx
git commit -m "feat: track detailed randomized pretest"
```

---

### Task 4: Levels 1 and 2 shared learning behavior

**Files:**
- Modify: `src/app/student/level/1/page.tsx`
- Modify: `src/app/student/level/1/page.test.tsx`
- Modify: `src/app/student/level/2/page.tsx`
- Modify: `src/app/student/level/2/page.test.tsx`

**Interfaces:**
- Consumes: `shuffleQuestions`, `secondsBetween`, detailed attempt model.
- Produces: five answer rows and first-try scores for recognition/matching.

- [ ] **Step 1: Write failing tests for exact spoken hints and automatic next-question speech**

For each level, confirm a wrong answer and assert the visible hint string equals the final `speakThai` argument. Correct the question, advance fake timers, and assert the newly rendered question’s complete prompt is spoken.

- [ ] **Step 2: Write failing attempt assertions**

Complete five questions with one question requiring two wrong confirmations. Assert the recorded answer has `wrong_count: 2`, `hint_used: true`, `first_try_correct: false`, and measured `duration_seconds`; assert the session score counts first-try correctness rather than eventual completion.

- [ ] **Step 3: Run both level tests and verify failures**

Run: `npm test -- --run src/app/student/level/1/page.test.tsx src/app/student/level/2/page.test.tsx`

Expected: FAIL on shuffle, exact speech, and detailed attempt assertions.

- [ ] **Step 4: Implement shuffled sessions and per-question state**

Give every Level 2 question a stable ID and canonical spoken prompt. Replace fixed initial speech and timeout speech with an effect keyed by question ID. Track wrong confirmations per active question; speak `currentQ.hint` exactly on each wrong confirmation. Finalize one answer row only when the correct response is confirmed.

- [ ] **Step 5: Record all five-question attempts and preserve 4/5 first-try passing**

At session completion, always call `recordAttempt`. Call `completeLevel` only at 4/5 or higher. On retry, reshuffle a fresh five-question session and reset both timers and analytics.

- [ ] **Step 6: Run focused tests and commit**

Run: `npm test -- --run src/app/student/level/1/page.test.tsx src/app/student/level/2/page.test.tsx`

Expected: PASS.

```bash
git add src/app/student/level/1/page.tsx src/app/student/level/1/page.test.tsx src/app/student/level/2/page.tsx src/app/student/level/2/page.test.tsx
git commit -m "feat: randomize and track early learning levels"
```

---

### Task 5: Level 3 flexible payment cases

**Files:**
- Modify: `src/app/student/level/3/page.tsx`
- Modify: `src/app/student/level/3/page.test.tsx`

**Interfaces:**
- Consumes: `MoneyQuantitySelector`, quantity helpers, session helpers.
- Produces: five randomized exact-payment questions and detailed answers containing expanded denomination arrays.

- [ ] **Step 1: Write failing tests for three valid 30-baht compositions**

```tsx
it.each([
  [[10, 10, 10], "10 × 3 = 30 บาท"],
  [[20, 10], "20 + 10 = 30 บาท"],
  [[10, 10, 5, 5], "5 × 2 + 10 × 2 = 30 บาท"],
])("accepts %j", async (clicks, equation) => {
  for (const value of clicks) await increment(value);
  expect(screen.getByText(equation)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "จ่ายเงิน" }));
  expect(mockPlaySoundEffect).toHaveBeenLastCalledWith("correct");
});
```

- [ ] **Step 2: Write failing tests for exact difference hint and five questions**

Underpay 30 baht with 10 baht and assert both UI and speech equal the canonical hint containing “ยังขาดอีก 20 บาท”. Verify question count renders “จาก 5”.

- [ ] **Step 3: Run Level 3 tests and verify the fixed-tray failures**

Run: `npm test -- --run src/app/student/level/3/page.test.tsx`

Expected: FAIL because duplicate tray items toggle independently and the bank contains only three questions.

- [ ] **Step 4: Replace trays with denomination lists and add five question records**

Use stable IDs, prompt builders, and five items priced between 15 and 50 baht. Render `MoneyQuantitySelector` with `[5, 10, 20, 50]`. Correctness depends only on `sumMoneyQuantities(quantities) === currentQ.price`.

- [ ] **Step 5: Add session tracking and first-try scoring**

Increment current wrong count only in `handlePay`. Store expanded values such as `[10, 10, 10]` in the answer. Finalize all five rows and record the attempt before progression.

- [ ] **Step 6: Run tests and commit**

Run: `npm test -- --run src/app/student/level/3/page.test.tsx src/lib/money.test.ts src/components/common/MoneyQuantitySelector.test.tsx`

Expected: PASS.

```bash
git add src/app/student/level/3/page.tsx src/app/student/level/3/page.test.tsx
git commit -m "feat: support flexible level three payments"
```

---

### Task 6: Level 4 five two-step exercises

**Files:**
- Modify: `src/app/student/level/4/page.tsx`
- Create: `src/app/student/level/4/page.test.tsx`

**Interfaces:**
- Consumes: shared selector and session helpers.
- Produces: one analytics row per two-step exercise with step-specific wrong counts.

- [ ] **Step 1: Write failing tests for five randomized questions and two-step hints**

Assert “ข้อที่ 1 จาก 5”, wrong total confirmation speaks the displayed total hint, the correct total advances to payment, and wrong payment speaks the displayed payment hint.

- [ ] **Step 2: Run the Level 4 test and verify it fails**

Run: `npm test -- --run src/app/student/level/4/page.test.tsx`

Expected: FAIL because only two questions exist and wrong payment has no visible canonical hint.

- [ ] **Step 3: Expand the bank and integrate the quantity selector**

Add five stable two-item questions with totals from 15 to 50 baht. Each has `sumHint` and payment difference hint generation. Automatic speech is keyed by `${currentQ.id}:${step}`.

- [ ] **Step 4: Track both steps in one answer record**

Store step details for `sum` and `payment`, including each step’s wrong count and duration. The question is first-try correct only if neither step received a wrong confirmation.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- --run src/app/student/level/4/page.test.tsx`

Expected: PASS.

```bash
git add src/app/student/level/4/page.tsx src/app/student/level/4/page.test.tsx
git commit -m "feat: expand and track level four exercises"
```

---

### Task 7: Level 5 guided five-scenario shopping session

**Files:**
- Modify: `src/app/student/level/5/page.tsx`
- Create: `src/app/student/level/5/page.test.tsx`

**Interfaces:**
- Consumes: products/shops, quantity selector, session helpers.
- Produces: five stable shopping scenarios and a complete Level 5 attempt.

- [ ] **Step 1: Write failing tests for a guided scenario**

Assert the page displays “ข้อที่ 1 จาก 5”, automatically reads the requested shop/products, treats a wrong cart confirmation as one wrong answer with the exact displayed hint, and accepts any exact money composition during payment.

- [ ] **Step 2: Run the Level 5 test and verify the free-form flow fails**

Run: `npm test -- --run src/app/student/level/5/page.test.tsx`

Expected: FAIL because the existing page is one free-form shopping activity.

- [ ] **Step 3: Define and render five guided scenarios**

Each scenario contains a stable ID, target shop ID, one or two target product IDs, prompt, cart hint, and payment hint builder. Retain the friendly shop/product UI, but add a scenario instruction and explicit cart confirmation before payment.

- [ ] **Step 4: Add automatic step speech and analytics**

Speak on scenario entry, cart step, and payment step using a stable question/step key. Count wrong cart and payment confirmations separately and combine them in the answer row. Use first-confirmation correctness for the score.

- [ ] **Step 5: Finish after five scenarios and record the attempt**

Reset shop, cart, payment quantities, feedback, timers, and step state between scenarios. After the fifth payment, record the attempt, complete Level 5, celebrate, and navigate to `/student/complete`.

- [ ] **Step 6: Run tests and commit**

Run: `npm test -- --run src/app/student/level/5/page.test.tsx`

Expected: PASS.

```bash
git add src/app/student/level/5/page.tsx src/app/student/level/5/page.test.tsx
git commit -m "feat: add guided level five scenarios"
```

---

### Task 8: Detailed teacher Dashboard

**Files:**
- Create: `src/lib/learningAnalytics.ts`
- Create: `src/lib/learningAnalytics.test.ts`
- Modify: `src/app/teacher/dashboard/page.tsx`
- Create: `src/app/teacher/dashboard/page.test.tsx`

**Interfaces:**
- Consumes: normalized attempts and preliminary assessment helper.
- Produces: `getLatestAttemptByLevel`, `formatDuration`, and Dashboard detail rows.

- [ ] **Step 1: Write failing analytics derivation tests**

```ts
expect(formatDuration(75)).toBe("1:15");
expect(getLatestAttemptByLevel(attempts, "student-1", 3)?.id).toBe("newest");
```

- [ ] **Step 2: Run analytics tests and verify missing exports fail**

Run: `npm test -- --run src/lib/learningAnalytics.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement pure Dashboard selectors**

Normalize optional legacy fields before sorting. Format seconds as `m:ss`, final money arrays as joined baht values, and empty values as `-`.

- [ ] **Step 4: Write a failing Dashboard component test**

Render fixtures containing a Pretest and Level 3 attempt. Assert the table shows the preliminary assessment plus its `4/5 · ผิด 1 ครั้ง` evidence, latest Level time/error summary, and expandable rows containing prompt, final answer, wrong count, duration, and hint use.

- [ ] **Step 5: Run the Dashboard test and verify detail UI is missing**

Run: `npm test -- --run src/app/teacher/dashboard/page.test.tsx`

Expected: FAIL because the existing Dashboard reads no attempts.

- [ ] **Step 6: Implement responsive summary and native expandable details**

Load `api.getAttempts()` beside existing data. Use semantic `<details>`/`<summary>` per student so no new modal state is required. Render legacy records safely with normalized zero/dash fields.

- [ ] **Step 7: Run focused Dashboard tests and commit**

Run: `npm test -- --run src/lib/learningAnalytics.test.ts src/app/teacher/dashboard/page.test.tsx`

Expected: PASS.

```bash
git add src/lib/learningAnalytics.ts src/lib/learningAnalytics.test.ts src/app/teacher/dashboard/page.tsx src/app/teacher/dashboard/page.test.tsx
git commit -m "feat: show detailed learning analytics dashboard"
```

---

### Task 9: Cross-level regression and production verification

**Files:**
- Modify only files implicated by failures from the commands below.

**Interfaces:**
- Consumes all prior task deliverables.
- Produces a verified production-ready feature set.

- [ ] **Step 1: Run the complete test suite**

Run: `npm test -- --run`

Expected: all test files and tests PASS with zero unhandled errors.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: exit code 0 with no ESLint errors.

- [ ] **Step 3: Run a production build**

Run: `npm run build`

Expected: exit code 0 and static routes generated for Pretest, Levels 1–5, path, completion, and Dashboard.

- [ ] **Step 4: Check patch integrity and requirement coverage**

Run: `git diff --check`

Expected: no whitespace errors. Re-read the design checklist and confirm speech, exact hints, five shuffled questions, quantity payments, timing/errors, storage compatibility, and Dashboard details each have an automated test.

- [ ] **Step 5: Commit any verified integration fixes**

```bash
git add src docs/superpowers/plans/2026-09-13-randomized-learning-analytics.md
git commit -m "test: verify randomized learning analytics"
```
