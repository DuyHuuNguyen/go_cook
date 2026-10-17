export const LectureType = {
    VIDEO: "VIDEO",
    EXAM: "EXAM",
} as const;

export type LectureType = typeof LectureType[keyof typeof LectureType];