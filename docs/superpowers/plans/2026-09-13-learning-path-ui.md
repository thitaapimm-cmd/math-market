# Learning Path UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route students through an explicit start action and the existing pre-test into a screenshot-inspired Level 1–5 learning path with matching audio feedback, confetti, no seeded students, and no Next.js development badge.

**Architecture:** Keep the existing Next.js App Router routes and local-storage API. Change only the student selection controller, path presentation, shared feedback utilities/configuration, and success hooks in activity pages. Preserve saved browser data and current progress semantics.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Vitest, Testing Library, Web Audio, Web Speech, canvas-confetti.

## Global Constraints

- Preserve the existing pre-test before the learning path for students without a pre-test result.
- Selecting a student must not navigate until “เริ่มเรียนเลย” is pressed.
- Fresh storage must contain no seeded mock students; migrate only the three exact legacy mock records out of existing storage and preserve user-created students.
- Locked levels remain disabled; current and completed levels remain replayable.
- Use soft, short feedback sounds and Thai speech matching the reference HTML.
- Do not implement teacher authentication, reports, post-test, shop management, or new activity content.
- Do not commit changes in this execution.

---

### Task 1: Explicit student selection and start

**Files:**
- Modify: `src/app/student/select/page.test.tsx`
- Modify: `src/app/student/select/page.tsx`

**Interfaces:**
- Consumes: `api.setCurrentStudent(student)`, `api.getAssessments(student.id)`, `playSoundEffect("click")`, `router.push(path)`.
- Produces: a pending `selectedStudentId` and `handleStartLearning()` action.

- [ ] **Step 1: Write failing tests** asserting card click does not navigate, enables “เริ่มเรียนเลย”, and the start action routes to `/student/pretest` or `/student/path` from assessment history.
- [ ] **Step 2: Run `npm test -- src/app/student/select/page.test.tsx`** and confirm failures show the current immediate navigation behavior and missing start button.
- [ ] **Step 3: Implement selection-only card handling and a disabled-until-selected start button.** Resolve the chosen student from the loaded list inside `handleStartLearning`, persist it, play click feedback, then route from the pre-test lookup.
- [ ] **Step 4: Re-run the focused test** and confirm all student selection tests pass.

### Task 2: Empty initial student storage

**Files:**
- Modify: `src/lib/storage.test.ts`
- Modify: `src/lib/storage.ts`

**Interfaces:**
- Consumes: `getStorageData<Student[]>("students", INITIAL_STUDENTS)`.
- Produces: `api.getStudents()` returning `[]` for a browser with no `math_market_students` key.

- [ ] **Step 1: Add a failing storage test** that removes `math_market_students`, calls `api.getStudents()`, and expects an empty array to be persisted.
- [ ] **Step 2: Run `npm test -- src/lib/storage.test.ts`** and confirm the test receives the three seeded records.
- [ ] **Step 3: Replace `INITIAL_STUDENTS` with an explicitly typed empty array.** Do not clear or migrate existing stored students.
- [ ] **Step 4: Re-run the focused test** and confirm all storage tests pass.

### Task 3: Screenshot-inspired learning path

**Files:**
- Create: `src/app/student/path/page.test.tsx`
- Modify: `src/app/student/path/page.tsx`
- Modify: `src/components/common/HeaderNav.tsx`

**Interfaces:**
- Consumes: `api.getCurrentStudent()`, `api.getProgress(student.id)`, `playSoundEffect`, `speakThai`, and `/student/level/[1-5]` routes.
- Produces: semantic level controls representing completed, current, and locked states.

- [ ] **Step 1: Add failing UI tests** for five cards, progress text, Thai descriptions, status labels, disabled locked controls, click sound and routing on enabled cards, and the listen action.
- [ ] **Step 2: Run `npm test -- src/app/student/path/page.test.tsx`** and confirm failures correspond to missing copy/layout behavior.
- [ ] **Step 3: Replace the colored full-card layout with the reference structure.** Use a wide centered layout, student summary, progress counter, conditional purple Free Practice banner, white horizontal level cards, colored icon tiles, status badges, and responsive stacking.
- [ ] **Step 4: Ensure header/listen actions call click feedback before navigation or speech.** Keep automatic greeting speech once mounted.
- [ ] **Step 5: Re-run the focused path test** and confirm it passes.

### Task 4: Matching audio and confetti

**Files:**
- Create: `src/lib/celebration.ts`
- Create: `src/lib/celebration.test.ts`
- Modify: `src/lib/speech.ts`
- Modify: `src/app/student/pretest/page.tsx`
- Modify: `src/app/student/level/1/page.tsx`
- Modify: `src/app/student/level/2/page.tsx`
- Modify: `src/app/student/level/3/page.tsx`
- Modify: `src/app/student/level/4/page.tsx`
- Modify: `src/app/student/level/5/page.tsx`

**Interfaces:**
- Produces: `celebrateCorrect(): void` for a small success burst and `celebrateCompletion(): void` for a larger completion burst.
- Consumes: `canvas-confetti`, shared Web Audio feedback, and existing correct/completion branches.

- [ ] **Step 1: Add failing celebration tests** mocking `canvas-confetti` and asserting correct-answer and completion particle counts.
- [ ] **Step 2: Run `npm test -- src/lib/celebration.test.ts`** and confirm the module is missing.
- [ ] **Step 3: Implement the two celebration helpers** with a restrained small burst and a larger completion burst.
- [ ] **Step 4: Update audio synthesis** to mirror the reference: 600 Hz short click, three-note ascending correct chime, and soft two-note encouraging tone for `wrong`; close each audio context after playback.
- [ ] **Step 5: Invoke the small burst on meaningful correct-answer feedback and the completion burst at the end of each question set.** Keep the existing final Level 5 celebration but route it through the shared helper.
- [ ] **Step 6: Run focused tests** and confirm celebration and activity tests pass.

### Task 5: Hide Next.js development indicator and verify

**Files:**
- Modify: `next.config.ts`

**Interfaces:**
- Produces: `devIndicators: false` using the installed Next.js 16 configuration API.

- [ ] **Step 1: Set `devIndicators: false`** as documented by `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/devIndicators.md`.
- [ ] **Step 2: Run `npm test`** and require zero failures.
- [ ] **Step 3: Run `npm run lint`** and require exit code 0.
- [ ] **Step 4: Run `npm run build`** and require exit code 0.
- [ ] **Step 5: Inspect `git diff --check` and `git diff`** to confirm no whitespace errors or unrelated edits were introduced.
