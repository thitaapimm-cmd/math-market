export const STUDENT_AVATAR_PRESET_PATHS = [
  "/avatars/student-01.png",
  "/avatars/student-02.png",
  "/avatars/student-03.png",
  "/avatars/student-04.png",
  "/avatars/student-05.png",
  "/avatars/student-06.png",
  "/avatars/student-07.png",
  "/avatars/student-08.png",
  "/avatars/student-09.png",
  "/avatars/student-10.png",
] as const;

export type StudentAvatarPresetPath =
  (typeof STUDENT_AVATAR_PRESET_PATHS)[number];

export const isStudentAvatarPresetPath = (
  value: string,
): value is StudentAvatarPresetPath =>
  (STUDENT_AVATAR_PRESET_PATHS as readonly string[]).includes(value);
