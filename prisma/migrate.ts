import "dotenv/config";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const dbPath = databaseUrl.startsWith("file:")
  ? databaseUrl.replace(/^file:/, "")
  : databaseUrl;

const resolvedDbPath = path.resolve(process.cwd(), "prisma", dbPath);
const migrationPath = path.resolve(
  process.cwd(),
  "prisma/migrations/0001_init_manual/migration.sql",
);

if (!existsSync(migrationPath)) {
  throw new Error(`Migration file not found: ${migrationPath}`);
}

mkdirSync(path.dirname(resolvedDbPath), { recursive: true });

execSync(`sqlite3 "${resolvedDbPath}" < "${migrationPath}"`, {
  stdio: "inherit",
  shell: "/bin/zsh",
});

console.log(`Applied manual SQLite migration to ${resolvedDbPath}`);
