# Learning Path UI and Student Start Flow Design

## Goal

Make the student journey deliberate and child-friendly: selecting a student only marks the selection, the student presses a separate start button, first-time students complete the existing pre-test, and all students then arrive at a Level 1–5 learning-path screen styled like the supplied reference screenshot.

## Student Entry Flow

- Selecting a student card stores only the pending selection and does not navigate.
- A large “เริ่มเรียนเลย” button remains disabled until a student is selected.
- Pressing the start button persists the selected student and plays the click sound.
- Students without a recorded pre-test go to `/student/pretest`.
- Students with a recorded pre-test go directly to `/student/path`.
- Completing the existing pre-test continues to `/student/path`.
- The three seeded mock students are removed. The empty state continues to allow creation of a student using the existing creation dialog.

## Learning Path UI

- Use a light blue-gray page background and a wide centered column matching the visual density of the supplied screenshot.
- Keep the branded application header at the top, but remove any Next.js development badge or starter control shown at the bottom-left.
- Show a student summary card containing avatar, greeting, supporting text, completed-level count, and a prominent listen button.
- Show a purple Free Practice banner only after all five levels are complete.
- Render five white horizontal level cards with a colored icon tile, level label, title, description, status badge, and trailing action icon.
- Completed levels remain replayable. The current level is emphasized and playable. Future levels remain visibly locked and disabled.
- Preserve the existing progress data model and Level 1–5 routes.
- On narrow screens, stack or condense summary information without clipping actions or status text.

## Sound and Celebration

- Match the reference HTML’s Web Audio behavior: a short light click, an ascending correct chime, a soft encouraging wrong-answer tone, and a celebratory sequence.
- Playing spoken Thai from a listen button also plays the click sound first.
- Use confetti for correct answers where the activity already presents a meaningful success moment, and use a larger burst at the end of a question set or completed level.
- Avoid continuous animation, harsh buzzers, or long effects that distract from the next question.
- Keep speech synthesis at a slightly slowed Thai rate for comprehension.

## Mock and Starter Content Removal

- Change initial student seed data from three mock students to an empty list.
- Remove only the three exact legacy mock records from existing browser storage; preserve every user-created student.
- Remove the visible Next.js development/starter badge at the lower-left through the supported Next.js configuration or application styling, without hiding unrelated application controls.

## Testing

- Verify selecting a student does not navigate and enables the start button.
- Verify the start button routes a first-time student to the pre-test.
- Verify the start button routes a returning student to the learning path.
- Verify fresh storage begins without the three seeded students.
- Verify the learning path renders all five levels and respects completed/current/locked states.
- Verify enabled level controls play a click sound and route correctly; locked levels do neither.
- Verify the listen action plays click feedback and invokes Thai speech.
- Verify correct and completion events trigger the intended confetti intensity.
- Run the focused tests, full test suite, lint, and production build.

## Scope

This pass does not add teacher authentication, reports, post-test, shop management, or new Level 1–5 question content. It changes entry behavior, learning-path presentation, shared feedback sounds, celebrations, initial mock data, and the Next.js development badge only.
