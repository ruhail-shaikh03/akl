import { z } from "zod";

export const createBucketItemSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional(),
  category: z.string().trim().max(60).optional(),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional(),
});
export type CreateBucketItemInput = z.infer<typeof createBucketItemSchema>;

export const updateBucketItemSchema = createBucketItemSchema.partial().extend({
  id: z.string().uuid(),
});
export type UpdateBucketItemInput = z.infer<typeof updateBucketItemSchema>;

export const toggleCompleteSchema = z.object({
  id: z.string().uuid(),
  completionPhotoBlobUrl: z.string().url().optional(),
});
export type ToggleCompleteInput = z.infer<typeof toggleCompleteSchema>;
