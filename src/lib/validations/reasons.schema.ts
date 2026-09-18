import { z } from "zod";

export const createReasonSchema = z.object({
  text: z.string().trim().min(1).max(500),
  imageUrl: z.string().url().optional(),
});
export type CreateReasonInput = z.infer<typeof createReasonSchema>;

export const updateReasonSchema = z.object({
  id: z.string().uuid(),
  text: z.string().trim().min(1).max(500).optional(),
  imageUrl: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateReasonInput = z.infer<typeof updateReasonSchema>;
