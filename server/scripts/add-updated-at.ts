import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function fix() {
  await sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW()`;
  console.log("✓ updated_at added");
  await sql.end();
}

fix().catch(e => { console.error("Failed:", e.message); process.exit(1); });
