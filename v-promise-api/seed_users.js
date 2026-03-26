import pool from "./src/config/db.js";
import bcrypt from "bcrypt";

async function seedUsers() {
  try {
    const roles = [
      { name: "Intake Executive", email: "intake@test.com", role_id: 2 },
      { name: "Vehicle Inspector", email: "inspector@test.com", role_id: 3 },
      { name: "Salesperson", email: "sales@test.com", role_id: 4 },
    ];

    const hashedPassword = await bcrypt.hash("admin123", 10);

    for (const role of roles) {
      const checkUser = await pool.query("SELECT id FROM users WHERE email = $1", [role.email]);
      if (checkUser.rows.length === 0) {
        await pool.query(
          "INSERT INTO users (email, password, role_id) VALUES ($1, $2, $3)",
          [role.email, hashedPassword, role.role_id]
        );
        console.log(`Created user: ${role.email} (${role.name})`);
      } else {
        console.log(`User already exists: ${role.email}`);
      }
    }

    await pool.end();
  } catch (err) {
    console.error("Seeding error:", err.message);
    process.exit(1);
  }
}

seedUsers();
