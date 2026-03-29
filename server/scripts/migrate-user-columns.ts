import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Adding missing columns to user table...");
  await sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS username TEXT UNIQUE`;
  await sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS display_username TEXT`;
  await sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT 'Wanderer'`;
  await sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS avatar TEXT`;
  await sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS links TEXT`;
  await sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS posted INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS answered INTEGER NOT NULL DEFAULT 0`;
  console.log("✓ Done! All columns added.");
  await sql.end();
}

migrate().catch((e) => {
  console.error("Migration failed:", e.message);
  process.exit(1);
});
