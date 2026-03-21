import pool from "./src/config/db.js";

async function checkConstraints() {
  try {
    const res = await pool.query(`
      SELECT table_name, column_name, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position
    `);
    
    console.log("Database Schema Constraints:");
    res.rows.forEach(row => {
      console.log(`${row.table_name}.${row.column_name}: Nullable=${row.is_nullable}, Default=${row.column_default}`);
    });

    await pool.end();
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

checkConstraints();
