import { z } from "zod";

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().trim().min(1).max(2000),
  ventMode: z.boolean().optional().default(false),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
