import pool from "./src/config/db.js";

async function addBranchId() {
    try {
        console.log("Checking if branch_id exists on users table...");
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS branch_id INT REFERENCES branches(id);
        `);
        console.log("Migration successful: branch_id column exists on users.");
    } catch (e) {
        console.error("Migration error:", e);
    } finally {
        process.exit();
    }
}

addBranchId();
