import pool from "./src/config/db.js";

async function checkIds() {
  try {
    const branches = await pool.query("SELECT id, branch_name FROM branches");
    console.log("Branches in DB:", branches.rows);

    const customers = await pool.query("SELECT id, name, branch_id FROM customers");
    console.log("Customers in DB:", customers.rows);

    const vehicles = await pool.query("SELECT id, vehicle_type FROM vehicles");
    console.log("Vehicles in DB:", vehicles.rows);

    await pool.end();
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

checkIds();
