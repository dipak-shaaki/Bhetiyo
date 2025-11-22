import pkg from "pg";
const { Pool } = pkg;

export let pool;

export default async function connectPostgres() {
  try {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
    });

    await pool.query("SELECT NOW()");
    console.log("PostgreSQL Connected");
  } catch (err) {
    console.error("Postgres Error:", err.message);
  }
}
