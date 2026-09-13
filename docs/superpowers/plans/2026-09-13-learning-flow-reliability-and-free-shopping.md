# Learning Flow Reliability and Free Shopping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix student deletion, Pretest correctness/audio timing, missing Level 2–4 question audio, Level 4 selection clarity, and implement Level 5 as four guided rounds followed by one free-shopping round.

**Architecture:** Keep localStorage as the data source and put cascade deletion in `api.deleteStudent()` so UI code cannot leave orphan records. Extend the audio layer with an awaitable playback function used only when navigation must wait. Keep Levels 2–4 driven by exact text-to-recording mappings, and model Level 5 rounds with an explicit discriminated `guided | free` round type.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Vitest, Testing Library, browser `Audio`, macOS `say` for bundled Thai `.m4a` assets.

## Global Constraints

- Work on the existing `main` branch as explicitly approved by the user.
- Preserve unrelated modified and untracked files already present in the worktree.
- Use TDD for every production behavior: write test, observe expected failure, implement minimum fix, rerun.
- Thai speech must work when `speechSynthesis` and `SpeechSynthesisUtterance` are unavailable.
- Money values remain limited to 1–100 baht.
- Level 5 consists of exactly four guided rounds followed by exactly one free-shopping round.
- No backend, authentication, cloud sync, product editor, or multi-quantity product cart is added.

---

## File Map

- `src/lib/storage.ts`: cascade deletion API.
- `src/lib/storage.test.ts`: storage deletion regression coverage.
- `src/app/student/select/page.tsx`: delete control, confirmation dialog, and local selection cleanup.
- `src/app/student/select/page.test.tsx`: deletion UI behavior.
- `src/lib/speech.ts`: exact Thai recording mappings and awaitable playback.
- `src/lib/speech.test.ts`: recording and playback-completion behavior.
- `src/app/student/pretest/page.tsx`: shuffled-question correctness and audio-driven progression.
- `src/app/student/pretest/page.test.tsx`: correct/hint behavior and navigation timing.
- `src/app/student/level/2/page.test.tsx`: exact Level 2 prompt checks.
- `src/app/student/level/3/page.test.tsx`: exact Level 3 prompt checks.
- `src/app/student/level/4/page.tsx`: high-contrast selected option.
- `src/app/student/level/4/page.test.tsx`: audio and selected-state checks.
- `src/app/student/level/5/page.tsx`: four guided rounds plus free-shopping round.
- `src/app/student/level/5/page.test.tsx`: hybrid-flow and analytics checks.
- `public/audio/th/*.m4a`: bundled Thai prompts for Levels 2–5.

---

### Task 1: Cascade Student Deletion

**Files:**
- Modify: `src/lib/storage.ts`
- Modify: `src/lib/storage.test.ts`
- Modify: `src/app/student/select/page.tsx`
- Modify: `src/app/student/select/page.test.tsx`

**Interfaces:**
- Produces: `api.deleteStudent(studentId: string): void`
- Consumes: localStorage keys `students`, `progress`, `assessments`, `attempts`, `current_student`

- [ ] **Step 1: Write the failing storage test**

Seed two students and related records, call `api.deleteStudent("student-a")`, then assert only student A and its records are removed and student B remains. Assert `current_student` becomes `null` only when it matches student A.

```ts
it("deletes a student and only that student's related records", () => {
  localStorage.setItem("math_market_students", JSON.stringify([studentA, studentB]));
  localStorage.setItem("math_market_progress", JSON.stringify([progressA, progressB]));
  localStorage.setItem("math_market_assessments", JSON.stringify([assessmentA, assessmentB]));
  localStorage.setItem("math_market_attempts", JSON.stringify([attemptA, attemptB]));
  localStorage.setItem("math_market_current_student", JSON.stringify(studentA));

  api.deleteStudent("student-a");

  expect(api.getStudents()).toEqual([studentB]);
  expect(api.getProgress("student-b")).toEqual([progressB]);
  expect(api.getAssessments()).toEqual([assessmentB]);
  expect(api.getAttempts()).toEqual([attemptB]);
  expect(api.getCurrentStudent()).toBeNull();
});
```

- [ ] **Step 2: Run the storage test and verify RED**

Run: `npm test -- --run src/lib/storage.test.ts`

Expected: FAIL because `api.deleteStudent` does not exist.

- [ ] **Step 3: Implement cascade deletion**

Add one storage API method that filters every student-owned collection and conditionally clears the current student.

```ts
deleteStudent: (studentId: string): void => {
  setStorageData("students", getStudents().filter((student) => student.id !== studentId));
  setStorageData("progress", getStorageData<StudentProgress[]>("progress", []).filter((item) => item.student_id !== studentId));
  setStorageData("assessments", getStorageData<AssessmentResult[]>("assessments", []).filter((item) => item.student_id !== studentId));
  setStorageData("attempts", getStorageData<Attempt[]>("attempts", []).filter((item) => item.student_id !== studentId));
  if (api.getCurrentStudent()?.id === studentId) api.setCurrentStudent(null);
},
```

- [ ] **Step 4: Add failing StudentSelect UI tests**

Test that every card exposes `ลบนักเรียน <ชื่อ>`, clicking it opens a named confirmation dialog, cancel leaves the student, and confirm calls `deleteStudent`, removes the card, clears `selectedStudentId`, and disables `เริ่มเรียนเลย`.

- [ ] **Step 5: Run StudentSelect test and verify RED**

Run: `npm test -- --run src/app/student/select/page.test.tsx`

Expected: FAIL because no delete button or dialog exists.

- [ ] **Step 6: Implement delete UI**

Wrap the selection button and delete button in a `relative` card container so nested interactive controls are avoided. Keep `pendingDeleteStudent` state and render a controlled `<dialog>` with cancel and destructive confirm buttons. On confirm:

```ts
api.deleteStudent(pendingDeleteStudent.id);
setStudents((items) => items.filter((item) => item.id !== pendingDeleteStudent.id));
setSelectedStudentId((id) => id === pendingDeleteStudent.id ? null : id);
setPendingDeleteStudent(null);
```

- [ ] **Step 7: Verify and commit**

Run: `npm test -- --run src/lib/storage.test.ts src/app/student/select/page.test.tsx`

Expected: PASS.

Commit: `git commit -m "feat: allow cascading student deletion"`

---

### Task 2: Awaitable Thai Audio Playback

**Files:**
- Modify: `src/lib/speech.ts`
- Modify: `src/lib/speech.test.ts`

**Interfaces:**
- Produces: `speakThaiAndWait(text: string, fallbackMs?: number): Promise<void>`
- Preserves: `speakThai(text: string): void`

- [ ] **Step 1: Write failing completion tests**

Test three paths with a controllable `AudioMock`: the Promise remains pending after `play()`, resolves after `onended`, and resolves after `onerror`. Add a fake-timer test proving the fallback timeout resolves even when neither event fires.

```ts
const promise = speakThaiAndWait("ถูกต้อง เก่งมาก", 3000);
expect(resolved).toBe(false);
audio.onended?.(new Event("ended"));
await expect(promise).resolves.toBeUndefined();
```

- [ ] **Step 2: Run speech test and verify RED**

Run: `npm test -- --run src/lib/speech.test.ts`

Expected: FAIL because `speakThaiAndWait` does not exist.

- [ ] **Step 3: Implement one-settlement playback**

Create an internal `playRecording(text, waitForEnd, fallbackMs)` helper. For awaited calls, attach `ended` and `error` listeners before `play()`, use one `settled` guard, clear the timeout on settlement, and resolve after browser-voice fallback or timeout if recording playback rejects. Keep `speakThai` fire-and-forget by calling the helper without waiting.

```ts
export const speakThaiAndWait = (text: string, fallbackMs = 5000) =>
  playThai(text, { waitForEnd: true, fallbackMs });
```

- [ ] **Step 4: Verify and commit**

Run: `npm test -- --run src/lib/speech.test.ts`

Expected: PASS with no unhandled Promise warnings.

Commit: `git commit -m "feat: support awaitable Thai speech playback"`

---

### Task 3: Fix Pretest Shuffle and Wait for Feedback Audio

**Files:**
- Modify: `src/app/student/pretest/page.tsx`
- Modify: `src/app/student/pretest/page.test.tsx`

**Interfaces:**
- Consumes: `speakThaiAndWait(text: string): Promise<void>`
- Preserves: five shuffled questions and detailed attempt recording

- [ ] **Step 1: Write failing shuffle-correctness test**

Mock a shuffle order where the first displayed question is not `q1`. Select that displayed question's correct answer and confirm. Assert the status says `ถูกต้อง`, contains no `คำใบ้`, and the recorded answer uses the displayed question ID.

- [ ] **Step 2: Run Pretest test and verify RED**

Run: `npm test -- --run src/app/student/pretest/page.test.tsx`

Expected: FAIL because `confirmAnswer` currently uses `QUESTIONS[currentIndex]` instead of `currentQ`.

- [ ] **Step 3: Fix question source**

Replace `const q = QUESTIONS[currentIndex]` with `const q = currentQ`, and use `questions.length` for progression, score totals, and completion metadata.

- [ ] **Step 4: Write failing audio-order test**

Mock `speakThaiAndWait` with a deferred Promise. Confirm an answer and assert `ข้อที่ 1 จาก 5` remains visible while the Promise is unresolved. Resolve the Promise, then assert `ข้อที่ 2 จาก 5` appears.

- [ ] **Step 5: Run Pretest test and verify RED**

Run: `npm test -- --run src/app/student/pretest/page.test.tsx`

Expected: FAIL because progression still uses a 1400ms timeout.

- [ ] **Step 6: Await feedback audio before advancing**

Make `confirmAnswer` async, show feedback and lock controls, then:

```ts
await speakThaiAndWait(isCorrect ? "ถูกต้อง เก่งมาก" : q.hint);
setSelectedAnswer(null);
setFeedback(null);
setIsChecking(false);
advanceToNextQuestionOrFinish(nextScore, nextAnswers);
```

Remove the fixed 1400ms timeout. Preserve fireworks at confirmation and completion.

- [ ] **Step 7: Verify and commit**

Run: `npm test -- --run src/app/student/pretest/page.test.tsx src/lib/speech.test.ts`

Expected: PASS.

Commit: `git commit -m "fix: align pretest feedback with shuffled questions"`

---

### Task 4: Bundle Level 2–4 Prompts and Clarify Level 4 Selection

**Files:**
- Modify: `src/lib/speech.ts`
- Modify: `src/lib/speech.test.ts`
- Modify: `src/app/student/level/2/page.test.tsx`
- Modify: `src/app/student/level/3/page.test.tsx`
- Modify: `src/app/student/level/4/page.tsx`
- Modify: `src/app/student/level/4/page.test.tsx`
- Create: `public/audio/th/question-l2-*.m4a`
- Create: `public/audio/th/question-l3-*.m4a`
- Create: `public/audio/th/question-l4-*.m4a`

**Interfaces:**
- Consumes: exact prompt strings already produced by Levels 2–4
- Produces: exact `THAI_RECORDINGS` entries for every Level 2–4 question and Level 4 payment step

- [ ] **Step 1: Write failing recording-map tests**

Use `it.each` to call `speakThai()` for every prompt from Levels 2–4 and assert `new Audio(expectedPath)` is invoked. Include all five prompts per level and the payment prompts needed by Level 4.

- [ ] **Step 2: Run speech and level tests and verify RED**

Run: `npm test -- --run src/lib/speech.test.ts src/app/student/level/2/page.test.tsx src/app/student/level/3/page.test.tsx src/app/student/level/4/page.test.tsx`

Expected: FAIL because the prompt strings have no bundled recording mappings.

- [ ] **Step 3: Generate recordings and register exact mappings**

For each prompt, generate an `.m4a` with the installed Thai Kanya voice:

```bash
say -v Kanya -r 165 -o public/audio/th/question-l2-milk-20.m4a 'นมสดกล่อง ราคา 20 บาท หนูจะเลือกเงินใบไหน?'
```

Repeat with explicit filenames for the remaining Level 2–4 prompts, then add exact keys and paths to `THAI_RECORDINGS`. Validate files using `file public/audio/th/question-*.m4a`.

- [ ] **Step 4: Write failing Level 4 selected-state test**

Click `20 บาท`, assert it has `aria-pressed="true"`, contains `เลือกแล้ว`, and has the selected high-contrast classes while an unselected option does not.

- [ ] **Step 5: Run Level 4 test and verify RED**

Run: `npm test -- --run src/app/student/level/4/page.test.tsx`

Expected: FAIL because the current selected and unselected buttons share the same classes and have no indicator.

- [ ] **Step 6: Implement selected-state UI**

Render option content with value plus conditional check text and classes:

```tsx
className={selectedTotal === opt
  ? "-translate-y-1 border-orange-700 bg-orange-600 text-white shadow-xl ring-4 ring-orange-200"
  : "border-orange-300 bg-orange-50 text-orange-950 hover:bg-orange-100"}
```

Keep `aria-pressed={selectedTotal === opt}` and show `<span>✓ เลือกแล้ว</span>` only for the selected option.

- [ ] **Step 7: Verify and commit**

Run: `npm test -- --run src/lib/speech.test.ts src/app/student/level/2/page.test.tsx src/app/student/level/3/page.test.tsx src/app/student/level/4/page.test.tsx`

Expected: PASS.

Commit: `git commit -m "fix: add reliable question audio and clear selections"`

---

### Task 5: Four Guided Rounds Plus One Free-Shopping Round

**Files:**
- Modify: `src/app/student/level/5/page.tsx`
- Modify: `src/app/student/level/5/page.test.tsx`
- Modify: `src/lib/speech.ts`
- Modify: `src/lib/speech.test.ts`
- Create: `public/audio/th/question-l5-guided-*.m4a`
- Create: `public/audio/th/question-l5-free-*.m4a`

**Interfaces:**
- Consumes: `api.getShops()`, `api.getProducts()`, `MoneyQuantitySelector`
- Produces: one Level 5 Attempt with five `AttemptAnswer` rows; the final answer has `question_id: "l5-free"` and step `name: "free_shopping"`

- [ ] **Step 1: Write failing hybrid-round tests**

Replace the test expecting five predefined scenarios with tests asserting:

- UI starts at `รอบที่ 1 จาก 5` with a guided prompt.
- Only four guided scenario IDs are present in the completed attempt.
- The fifth screen says `รอบเลือกซื้อเอง` and does not prescribe a shop or item.
- Selecting a shop filters the visible products to those whose `shop_ids` include that shop.
- Selecting one or more products and confirming shows their computed total.
- Exact payment completes Level 5 and records the free selection in the fifth answer.

- [ ] **Step 2: Run Level 5 test and verify RED**

Run: `npm test -- --run src/app/student/level/5/page.test.tsx`

Expected: FAIL because all five current rounds are predefined scenarios.

- [ ] **Step 3: Introduce explicit round model**

```ts
type GuidedRound = { kind: "guided"; id: string; shopId: string; productIds: string[] };
type FreeRound = { kind: "free"; id: "l5-free" };
type ShoppingRound = GuidedRound | FreeRound;

const rounds: ShoppingRound[] = [
  ...shuffleQuestions(GUIDED_ROUNDS, Math.random, 4),
  { kind: "free", id: "l5-free" },
];
```

Use storage shops/products as the rendered catalog. Guided rounds derive their required shop and products by ID. Free round uses user state as the source of truth.

- [ ] **Step 4: Implement free-round interaction**

In the free round:

- Render both active shops.
- On shop change, run `setSelectedProductIds([])`.
- Render only active products containing the selected shop ID.
- Toggle each product ID at most once.
- Disable product confirmation until at least one item is selected.
- Compute `total = selectedProducts.reduce((sum, product) => sum + product.price, 0)`.
- Continue to the existing quantity-based money payment step.

- [ ] **Step 5: Record free-shopping analytics**

Create the fifth `AttemptAnswer` with a human-readable prompt and structured steps:

```ts
{
  question_id: "l5-free",
  prompt: `เลือกซื้อเองที่${shop.name}: ${products.map((item) => item.name).join(" และ ")} รวม ${total} บาท`,
  answer: expandMoneyQuantities(quantities),
  correct: true,
  first_try_correct: wrongCount === 0,
  hint_used: wrongCount > 0,
  wrong_count: wrongCount,
  duration_seconds,
  steps: [
    { name: "free_shopping", answer: `${shop.id}|${productIds.join(",")}`, correct: true, wrong_count: wrongCount, duration_seconds },
  ],
}
```

- [ ] **Step 6: Add exact Thai recordings for Level 5**

Bundle the four guided first prompts and fixed phase instructions. Free-round speech uses fixed prompts such as `รอบเลือกซื้อเอง เลือกร้านที่หนูชอบ` and `เลือกสินค้าที่หนูอยากซื้อ แล้วกดยืนยันสินค้า`, so it does not require synthesizing the child's dynamic selection.

- [ ] **Step 7: Verify and commit**

Run: `npm test -- --run src/app/student/level/5/page.test.tsx src/lib/speech.test.ts`

Expected: PASS.

Commit: `git commit -m "feat: add free shopping finale to level 5"`

---

### Task 6: End-to-End Verification

**Files:**
- Modify only files required by issues found during verification

**Interfaces:**
- Verifies all public UI and storage behavior from Tasks 1–5

- [ ] **Step 1: Run full automated verification**

Run:

```bash
npm test -- --run
npm run lint
npm run build
git diff --check
```

Expected: all tests pass, ESLint exits 0, Next production build exits 0, and diff check has no output.

- [ ] **Step 2: Verify browser flows manually**

Using the existing local dev server and browser:

- Open the student deletion confirmation dialog for a disposable student, verify the warning and cancel it; rely on the isolated storage/UI tests for destructive confirmation behavior.
- Complete a shuffled Pretest correct answer; verify no hint appears and question does not change until audio ends.
- Open Levels 2, 3, and 4; verify their first question audio resources load with HTTP 200 and browser console has no audio errors.
- Select a Level 4 option; verify the visible check, contrast, ring, and `aria-pressed` state.
- Reach Level 5 round 5; select a shop and products freely, pay the computed total, and verify completion.

- [ ] **Step 3: Inspect scope and commit any verification-only fix**

Run `git status --short` and ensure unrelated existing dirty files were not staged. If verification required a code fix, follow a fresh RED/GREEN cycle and commit only its scoped files.
