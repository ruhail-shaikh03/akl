import { z } from "zod";

export const submitMoodCheckinSchema = z.object({
  level: z.number().int().min(1).max(5),
  note: z.string().trim().max(500).optional(),
});
export type SubmitMoodCheckinInput = z.infer<typeof submitMoodCheckinSchema>;
