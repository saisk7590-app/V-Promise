import pool from "../src/config/db.js";

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        console.log("Adding role column to users table...");
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'SALES'`);
        
        // Optionally migrate data from roles table if it exists
        const { rows: roles } = await client.query("SELECT * FROM roles");
        if (roles.length > 0) {
            console.log("Migrating role data...");
            for (const r of roles) {
                await client.query("UPDATE users SET role = $1 WHERE role_id = $2", [r.role_name, r.id]);
            }
        }

        await client.query("COMMIT");
        console.log("Follow-up migration completed successfully.");
    } catch (e) {
        await client.query("ROLLBACK");
        console.error("Migration failed:", e);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
