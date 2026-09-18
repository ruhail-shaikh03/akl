import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// dotenv doesn't override already-set vars, so loading .env.local first
// then .env gives .env.local precedence when both exist, matching Next.js.
config({ path: ".env.local" });
config({ path: ".env" });

// `generate` only diffs schema files and doesn't need a live connection;
// `migrate` and `studio` do, and will fail clearly if DATABASE_URL is unset.
export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
