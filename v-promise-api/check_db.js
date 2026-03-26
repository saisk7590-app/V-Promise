import pool from "./src/config/db.js";

async function checkUsers() {
  try {
    const roles = await pool.query("SELECT * FROM roles");
    console.log("Roles:", roles.rows);
    
    const users = await pool.query(`
      SELECT u.id, u.name, u.email, r.role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id
    `);
    console.log("Users:", users.rows);
    
    await pool.end();
  } catch (err) {
    console.error("Database error:", err.message);
    process.exit(1);
  }
}

checkUsers();
