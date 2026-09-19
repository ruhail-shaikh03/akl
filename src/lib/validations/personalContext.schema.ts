import { z } from "zod";

export const updatePersonalContextSchema = z.object({
  partnerName: z.string().trim().min(1).max(100),
  nicknames: z.array(z.string().trim().min(1)).max(20),
  insideJokes: z.array(z.string().trim().min(1)).max(30),
  cheerUpList: z.array(z.string().trim().min(1)).max(30),
  favorites: z.record(z.string(), z.array(z.string())),
  avoidTopics: z.array(z.string().trim().min(1)).max(20),
  tone: z.string().trim().max(200),
  language: z.string().trim().max(200),
  relationshipStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  partnerBirthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adminName: z.string().trim().min(1).max(100),
});
export type UpdatePersonalContextInput = z.infer<typeof updatePersonalContextSchema>;
