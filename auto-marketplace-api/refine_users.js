import pool from "./src/config/db.js";
import bcrypt from "bcrypt";

async function refineUsers() {
  try {
    // 1. Delete all existing users to clean up accidental ones
    await pool.query("DELETE FROM users");
    console.log("Cleared existing users.");

    // 2. Define users with names and correct roles
    const users = [
      { name: "Super Admin", email: "admin@test.com", role_id: 1 },
      { name: "John Intake", email: "intake@test.com", role_id: 2 },
      { name: "Sarah Inspector", email: "inspector@test.com", role_id: 3 },
      { name: "Mike Sales", email: "sales@test.com", role_id: 4 },
    ];

    const hashedPassword = await bcrypt.hash("admin123", 10);

    // 3. Insert users
    for (const user of users) {
      await pool.query(
        "INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4)",
        [user.name, user.email, hashedPassword, user.role_id]
      );
      console.log(`Created user: ${user.name} (${user.email})`);
    }

    await pool.end();
    console.log("Database refinement complete!");
  } catch (err) {
    console.error("Refinement error:", err.message);
    process.exit(1);
  }
}

refineUsers();
