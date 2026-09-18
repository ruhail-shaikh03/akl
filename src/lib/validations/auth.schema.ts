import { z } from "zod";

export const loginSchema = z.object({
  role: z.enum(["partner", "admin"]),
  passcode: z.string().min(1).max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;
