import { z } from 'zod';

/**
 * Canonical lesson-file schema (content/lessons/*.json).
 *
 * Establishes the pattern for extracting the hardcoded lessons.ts
 * (~2500 lines) into validated JSON. TODO: migrate remaining lessons
 * file-by-file; each new file must pass scripts/validate-lessons.ts.
 */

export const singleDrillSchema = z.object({
  display: z.string(),
  key: z.string(),
  keyCode: z.string(),
  shift: z.boolean(),
  fingerPosition: z.number().int().min(1).max(10).optional(),
  fingerName: z.enum(['Pinky', 'Ring', 'Middle', 'Index', 'Thumb']).optional(),
});

export const drillSchema = z.object({
  prompt: z.string().min(1),
  steps: z.array(singleDrillSchema),
});

export const lessonSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  text: z.string().optional(),
  drills: z.array(drillSchema).optional(),
  row: z
    .enum([
      'home-row',
      'top-row',
      'bottom-row',
      'mixed-row',
      'kar-row',
      'hasanta-row',
      'phola-row',
      'conjunct-row',
      'special-row',
      'number-row',
      'words-row',
    ])
    .optional(),
  isWordDrill: z.boolean().optional(),
}).refine((l) => l.text !== undefined || (l.drills !== undefined && l.drills.length > 0), {
  message: 'lesson must have either text or a non-empty drills array',
});

export const lessonFileSchema = z.object({
  version: z.literal(1),
  lessons: z.array(lessonSchema).min(1),
});

export type LessonFile = z.infer<typeof lessonFileSchema>;
export type LessonJson = z.infer<typeof lessonSchema>;
