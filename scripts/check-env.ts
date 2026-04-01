import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .refine(
      (value) => value.startsWith("postgresql://") || value.startsWith("postgres://"),
      "DATABASE_URL must be a PostgreSQL connection string",
    ),
  DATABASE_URL_UNPOOLED: z
    .string()
    .optional()
    .refine(
      (value) =>
        value === undefined ||
        value === "" ||
        value.startsWith("postgresql://") ||
        value.startsWith("postgres://"),
      "DATABASE_URL_UNPOOLED must be a PostgreSQL connection string when provided",
    ),
  DIRECT_URL: z
    .string()
    .optional()
    .refine(
      (value) =>
        value === undefined ||
        value === "" ||
        value.startsWith("postgresql://") ||
        value.startsWith("postgres://"),
      "DIRECT_URL must be a PostgreSQL connection string when provided",
    ),
  AI_PROVIDER: z.enum(["mock", "openai"]).optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Environment validation failed:");
  for (const issue of result.error.issues) {
    console.error(`- ${issue.path.join(".") || "env"}: ${issue.message}`);
  }
  process.exit(1);
}

const maskedDatabaseUrl = result.data.DATABASE_URL.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
const resolvedDirectUrl =
  result.data.DIRECT_URL || result.data.DATABASE_URL_UNPOOLED || result.data.DATABASE_URL;
const maskedDirectUrl = resolvedDirectUrl.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");

console.log("Environment validation passed.");
console.log(`- DATABASE_URL: ${maskedDatabaseUrl}`);
console.log(`- DIRECT_URL (resolved): ${maskedDirectUrl}`);
console.log(
  `- DIRECT_URL source: ${
    result.data.DIRECT_URL
      ? "DIRECT_URL"
      : result.data.DATABASE_URL_UNPOOLED
        ? "DATABASE_URL_UNPOOLED"
        : "DATABASE_URL"
  }`,
);
console.log(`- AI_PROVIDER: ${result.data.AI_PROVIDER ?? "mock"}`);
