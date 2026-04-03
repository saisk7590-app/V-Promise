import pool from "./src/config/db.js";

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vehicles'
    `);
    console.log("Vehicles table columns:", res.rows);
    await pool.end();
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

checkSchema();
