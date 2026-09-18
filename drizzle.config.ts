import { defineConfig } from "drizzle-kit";

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
