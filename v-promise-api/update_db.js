import pool from "./src/config/db.js";


async function updateDb() {
  try {
    console.log("Starting database update...");

    // 1. Reset Roles and Users Table
    console.log("Truncating tables...");
    await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE;");
    await pool.query("TRUNCATE TABLE roles RESTART IDENTITY CASCADE;");

    // 2. Insert Correct V-Promise Roles
    console.log("Inserting roles...");
    await pool.query(`
      INSERT INTO roles (role_name) VALUES
      ('Admin'),
      ('Sales Executive'),
      ('Inspection Executive'),
      ('Valuation Manager'),
      ('Inventory Manager');
    `);

    // 3. Insert Test Users
    console.log("Inserting test users...");
    // Password for all users: admin123
    // Hash provided in the request: $2b$10$iMUhoe1O3s6b5N8p1/RrUu3pUzd5qQWNgOksBar3JXLhAAxVPUFVu
    await pool.query(`
      INSERT INTO users (name, email, password, role_id) VALUES
      ('Super Admin','admin@test.com','$2b$10$iMUhoe1O3s6b5N8p1/RrUu3pUzd5qQWNgOksBar3JXLhAAxVPUFVu', 1),
      ('Rahul Sales','sales@test.com','$2b$10$iMUhoe1O3s6b5N8p1/RrUu3pUzd5qQWNgOksBar3JXLhAAxVPUFVu', 2),
      ('Amit Inspector','inspector@test.com','$2b$10$iMUhoe1O3s6b5N8p1/RrUu3pUzd5qQWNgOksBar3JXLhAAxVPUFVu', 3),
      ('Priya Valuation','valuation@test.com','$2b$10$iMUhoe1O3s6b5N8p1/RrUu3pUzd5qQWNgOksBar3JXLhAAxVPUFVu', 4),
      ('Kiran Inventory','inventory@test.com','$2b$10$iMUhoe1O3s6b5N8p1/RrUu3pUzd5qQWNgOksBar3JXLhAAxVPUFVu', 5);
    `);

    console.log("Database update completed successfully.");
    
    // Verify
    const roles = await pool.query("SELECT * FROM roles ORDER BY id");
    console.log("Roles in DB:", roles.rows);
    
    const users = await pool.query(`
      SELECT u.id, u.email, r.role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.id
    `);
    console.log("Users in DB:", users.rows);

    await pool.end();
  } catch (err) {
    console.error("Database update error:", err.message);
    process.exit(1);
  }
}

updateDb();
