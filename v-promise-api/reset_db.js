import pool from "./src/config/db.js";

async function resetSequences() {
  try {
    console.log("Resetting sequences and clearing data...");
    
    // Clear data and restart identity
    await pool.query("TRUNCATE TABLE vehicle_images RESTART IDENTITY CASCADE");
    await pool.query("TRUNCATE TABLE vehicles RESTART IDENTITY CASCADE");
    await pool.query("TRUNCATE TABLE customers RESTART IDENTITY CASCADE");
    await pool.query("TRUNCATE TABLE branches RESTART IDENTITY CASCADE");

    console.log("Seeding initial branches again...");
    const branches = [
      { name: "Main Branch", city: "Hyderabad" },
      { name: "Secunderabad Branch", city: "Secunderabad" },
      { name: "Hitech City Branch", city: "Hyderabad" },
      { name: "Kukatpally Branch", city: "Hyderabad" }
    ];

    for (const branch of branches) {
      await pool.query(
        "INSERT INTO branches (branch_name, city) VALUES ($1, $2) ON CONFLICT (branch_name) DO NOTHING",
        [branch.name, branch.city]
      );
    }

    console.log("All systems reset. Sequences start from 1. Branches seeded.");
    await pool.end();
  } catch (err) {
    console.error("Error resetting systems:", err.message);
    process.exit(1);
  }
}

resetSequences();
