import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function check() {
  const cols = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'user'
    ORDER BY ordinal_position
  `;
  console.log("Columns in 'user' table:");
  cols.forEach(c => console.log(` - ${c.column_name} (${c.data_type}, nullable: ${c.is_nullable})`));
  await sql.end();
}

check().catch(e => { console.error(e.message); process.exit(1); });
