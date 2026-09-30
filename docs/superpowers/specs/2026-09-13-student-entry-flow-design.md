# Student Entry Flow Design

## Goal

Simplify the Math Market landing page so children enter through a single central market button, while keeping teacher access visible but unobtrusive. Move student selection and creation to a dedicated student entry page.

## Landing Page (`/`)

- Remove the existing student selector and disabled/enabled “Start learning” flow.
- Place the Math Market bucket/cart logo at the visual center of the page as the primary interactive control.
- Clicking the logo navigates to `/student/select`.
- Place the Teacher Mode link at the bottom-left of the viewport and keep its existing destination, `/teacher/dashboard`.
- Preserve the cheerful, child-friendly visual language and responsive layout.

## Student Entry Page (`/student/select`)

- Present two clear actions: “Choose student” and “Create new student.”
- “Choose student” reveals the current student cards.
- Selecting a student sets that student as current and follows the existing routing rule:
  - no pre-test result: `/student/pretest`
  - existing pre-test result: `/student/path`
- “Create new student” opens a modal on the same page.

## Create Student Modal

- Collect exactly one required name and one required preset avatar.
- Do not request an uploaded image.
- Use the user-provided portrait sheet as the source for ten preset child avatars. Crop the sheet into individual project-local image assets without redrawing or altering the supplied portraits.
- Disable submission until both values are present.
- On submission, create a locally unique student record, persist it in browser storage, refresh the student list, select the new student, close the modal, and leave the user on `/student/select` so the result is visible.
- The modal can be dismissed without saving.
- Validation errors remain inline and use clear Thai copy.

## Data Changes

- Add a storage API method for appending a student without overwriting existing students.
- Continue using the existing `Student` model. Generate `id`, `student_code`, and `created_at` locally; store the chosen preset image path in `avatar_url`.
- No server, authentication, classroom entry, image upload, or deletion flow is included.

## Typography

- Use Google Fonts through Next.js font support rather than manual stylesheet tags.
- Use Prompt (weights 400, 500, 600, 700, 800) for headings, buttons, labels, and general UI.
- Use Sarabun (weights 400, 600, 700) for longer Thai supporting text.
- Set the document language to Thai and provide local CSS variables for both font families.

## Accessibility and Responsive Behavior

- The central logo is a real link or button with a meaningful accessible name.
- Student and avatar choices expose selected state and support keyboard operation.
- The modal has a labelled dialog, an explicit close control, and a visible focus style.
- Mobile layouts stack controls without clipping; Teacher Mode remains reachable at bottom-left.
- Student photos/avatars render consistently whether they are emoji presets or future image URLs.

## Verification

- Run lint and production build.
- Verify `/` contains no student selection controls, centers the market button, and positions Teacher Mode bottom-left.
- Verify the market button navigates to `/student/select`.
- Verify choosing both an existing student with and without a prior pre-test follows the correct route.
- Verify the create modal requires name and avatar, persists a new student, and displays it after creation.
- Verify representative desktop and mobile viewport layouts in the browser.
