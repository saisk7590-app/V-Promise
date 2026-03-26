import pool from "./src/config/db.js";

async function seedBranches() {
  try {
    console.log("Seeding branches...");
    const branches = [
      { name: "Main Branch", city: "Hyderabad" },
      { name: "Secunderabad Branch", city: "Secunderabad" },
      { name: "Hitech City Branch", city: "Hyderabad" },
      { name: "Kukatpally Branch", city: "Hyderabad" }
    ];

    for (const branch of branches) {
      await pool.query(
        "INSERT INTO branches (branch_name, city) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [branch.name, branch.city]
      );
    }

    console.log("Branches seeded successfully.");
    await pool.end();
  } catch (err) {
    console.error("Error seeding branches:", err.message);
    process.exit(1);
  }
}

seedBranches();
