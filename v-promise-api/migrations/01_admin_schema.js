import pool from "../src/config/db.js";

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        console.log("Creating ENUM types...");
        // Use DO blocks to safely create types if they don't exist
        await client.query(`
            DO $$ BEGIN
                CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        await client.query(`
            DO $$ BEGIN
                CREATE TYPE branch_status AS ENUM ('ACTIVE', 'INACTIVE');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        console.log("Updating branches table...");
        // Rename branch_name to name
        await client.query(`
            DO $$ BEGIN
                ALTER TABLE branches RENAME COLUMN branch_name TO name;
            EXCEPTION
                WHEN undefined_column THEN null;
            END $$;
        `);
        // Add status and updated_at
        await client.query(`ALTER TABLE branches ADD COLUMN IF NOT EXISTS status branch_status DEFAULT 'ACTIVE'`);
        await client.query(`ALTER TABLE branches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
        // Add unique constraint on name and city (case-insensitive)
        await client.query(`DROP INDEX IF EXISTS idx_unique_branch_name_city`);
        await client.query(`CREATE UNIQUE INDEX idx_unique_branch_name_city ON branches (LOWER(name), LOWER(city))`);

        console.log("Updating users table...");
        // Rename password to password_hash
        await client.query(`
            DO $$ BEGIN
                ALTER TABLE users RENAME COLUMN password TO password_hash;
            EXCEPTION
                WHEN undefined_column THEN null;
            END $$;
        `);
        // Add status, updated_at, branch_id
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status user_status DEFAULT 'ACTIVE'`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS branch_id INTEGER REFERENCES branches(id)`);

        await client.query("COMMIT");
        console.log("Migration completed successfully.");
    } catch (e) {
        await client.query("ROLLBACK");
        console.error("Migration failed:", e);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
