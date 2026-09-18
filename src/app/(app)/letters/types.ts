import type { letters } from "@/db/schema";

export type Letter = typeof letters.$inferSelect;
