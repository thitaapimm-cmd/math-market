# Randomized Learning and Analytics Design

## Goal

Make Pretest and Levels 1–5 consistent, measurable learning sessions: five randomized exercises per run, automatic Thai speech for each question, exact spoken hints after wrong confirmations, flexible repeated-money composition, and detailed teacher analytics.

## Scope and constraints

- Keep the application client-side and persist data in the existing `math_market_*` localStorage records.
- Support Thai denominations 1, 2, 5, 10, 20, 50, and 100 baht only.
- Keep the existing student, progress, celebration, and level-unlocking flows.
- Existing stored records must continue to load when new analytics fields are absent.
- A wrong answer is counted only when the learner presses the confirmation/payment button, not when selecting or changing an option.
- Every Pretest and Level session contains exactly five exercises. Their order is shuffled once at session start and remains stable until that session ends or restarts.

## Recommended architecture

Use shared, testable utilities for question shuffling, money quantities, session timing, attempt recording, and assessment summaries. Pages retain their distinct teaching UI but consume the same session data model. This avoids a large generic renderer while ensuring that analytics from every level have identical meaning.

### Question banks and randomization

Each activity owns a typed bank of at least five questions with stable question IDs, display text, spoken question text, and exact hint text. A shared Fisher–Yates helper shuffles a copied array so source banks are never mutated. Each page stores the shuffled five-question session once during initialization.

- Pretest: five mixed recognition, matching, and addition questions.
- Level 1: five denomination-recognition questions.
- Level 2: five price-to-money matching questions.
- Level 3: five single-item exact-payment questions.
- Level 4: five two-item total-and-payment questions.
- Level 5: five guided shop scenarios, each requiring the learner to choose the requested product or products and pay the exact total.

Randomization affects order, not difficulty or scoring. Tests inject or mock randomness so expected exercises are deterministic.

### Automatic Thai speech and hints

Question speech is driven by the current stable question ID and, for multi-step exercises, the current step. A question is spoken automatically when it first appears. Advancing a question changes the ID and triggers the next speech without manually duplicating speech calls inside timeouts.

Each question or step contains one canonical `hint` string. After an incorrect confirmation, the UI displays that exact string and passes the same string to `speakThai`. Correct feedback continues to use correct sound, Thai speech, and celebration. Selecting money continues to announce the denomination but does not count as an answer.

### Quantity-based money selector

Levels 3–5 use a quantity map keyed by denomination instead of duplicate physical money IDs:

```ts
type MoneyQuantities = Partial<Record<MoneyValue, number>>;
```

Each denomination appears once. Pressing its card increments the quantity and announces that denomination. A visible badge shows `×2`, `×3`, and so on. A small decrement control removes one unit, and a “ล้างเงิน” control resets the entire selection. The summary expands quantities into an understandable equation such as `10 × 3 = 30 บาท` or `20 + 10 = 30 บาท`. Any combination is correct when its numeric total exactly matches the target; no fixed composition is required.

Quantities cannot become negative. Payments above or below the price remain selectable and are evaluated only when the payment button is pressed, allowing targeted spoken hints about the difference.

### Session and per-question tracking

The existing `Attempt` record is extended compatibly. Each completed session records:

- start and completion timestamps;
- total duration in whole seconds;
- score and total questions;
- total incorrect confirmations and hint count;
- one answer record per question.

Each answer record contains:

- stable question ID and prompt snapshot;
- final answer, including expanded money values for payment exercises;
- whether the exercise was eventually completed correctly and whether it was correct on the first confirmation;
- wrong confirmation count;
- elapsed seconds for that question;
- whether a hint was shown;
- optional step details for Level 4 and Level 5.

Timers use `Date.now()` through a small injectable clock helper. The question timer begins when a question becomes active and ends when it is completed. Leaving a page before finishing does not create a misleading completed attempt.

Pretest continues to create an `AssessmentResult` for score compatibility and additionally creates a detailed Level 0 `Attempt` with `activity_type: "pretest"`.

### Scoring and progression

Learning exercises remain active until the learner reaches the correct answer, but award one score point only when the first confirmation was correct. Wrong confirmations increase error and hint metrics without blocking the learner from completing that exercise. Levels 1–4 retain the existing 4/5 first-try passing threshold. Level 5 completes after all five guided shopping scenarios are eventually paid correctly and records the same first-try score for teacher review.

Pretest is different by design: each question accepts one confirmed answer, records whether it was correct, shows and speaks its hint when wrong, then advances. It does not allow correction before scoring because it is a baseline assessment.

When a learner repeats a level, every session is retained in attempts. `StudentProgress` continues to store first score, best score, and number of completed attempts.

### Teacher Dashboard

The dashboard loads students, progress, assessments, and attempts. It provides:

1. Existing cohort summary cards.
2. A compact student table showing Pretest score, each level status, latest session time, and latest wrong count.
3. A per-student expandable detail section listing attempts by date and level.
4. A per-question table with prompt, final answer, wrong count, time, and hint usage.

The preliminary assessment is deterministic and explains its evidence:

- **พร้อมเรียนต่อ**: Pretest score at least 4/5, equivalent to no more than one wrong answer.
- **กำลังพัฒนา**: Pretest score 2–3/5, equivalent to two or three wrong answers.
- **ควรฝึกเพิ่มเติม**: Pretest score 0–1/5, equivalent to four or five wrong answers.
- **รอประเมิน**: no completed Pretest.

The dashboard shows the score and wrong-count evidence next to the label. Missing fields in legacy attempts render as a dash or zero rather than breaking the page.

## Data flow

1. A page creates one shuffled five-question session and records its start time.
2. The active question starts its own timer and triggers Thai prompt speech.
3. Selection changes only the pending answer and may announce money.
4. Confirmation evaluates the pending answer and preserves whether the first confirmation was correct.
5. A wrong confirmation increments that question’s error count, displays the canonical hint, and speaks the exact hint.
6. In learning levels, a correct confirmation finalizes the question analytics and advances. In Pretest, the first confirmation finalizes and advances whether correct or wrong.
7. Completing the fifth exercise writes one detailed attempt, updates assessment/progress where applicable, plays completion feedback, and navigates onward.
8. The Dashboard derives summaries from persisted attempts without mutating learning records.

## Error handling and accessibility

- Confirmation and payment buttons stay disabled until an answer or money quantity exists.
- Rapid repeat confirmation is blocked while correct feedback and navigation are pending.
- Speech failure remains non-blocking; visual text and sound effects still provide feedback.
- Quantity controls use explicit accessible labels such as “เพิ่มเหรียญ 10 บาท” and “ลดเหรียญ 10 บาท”.
- Stored malformed or legacy optional analytics are normalized before display.

## Testing strategy

- Unit-test non-mutating shuffle behavior with deterministic random values.
- Unit-test increment, decrement, reset, expansion, formatting, and summing of money quantities.
- Unit-test attempt normalization and preliminary-assessment thresholds.
- Component-test automatic question speech on first render and after advancement.
- Component-test that wrong feedback speaks the exact displayed hint.
- Component-test Level 3 acceptance of `10 × 3`, `20 + 10`, and mixed `10 × 2 + 5 × 2` payments for a 30-baht exercise.
- Component-test five exercises and persisted per-question timing/error counts for every level.
- Component-test Dashboard summary and expanded detail rendering from realistic attempt fixtures.
- Run the complete test suite, ESLint, production build, and `git diff --check` before completion.
