import pool from './src/config/db.js';

async function fixDB() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    // 1. Delete customer ID 3
    console.log("Deleting customer ID 3...");
    await client.query("DELETE FROM customers WHERE id = 3");

    // 2. Change R Atchuta Rao (ID 2) to ID 1
    console.log("Re-mapping customer ID 2 to 1...");
    // Drop foreign key temporarily
    await client.query("ALTER TABLE vehicles DROP CONSTRAINT fk_vehicle_customer");
    
    // Update IDs
    await client.query("UPDATE customers SET id = 1 WHERE id = 2");
    await client.query("UPDATE vehicles SET customer_id = 1 WHERE customer_id = 2");

    // Restore foreign key
    await client.query(`
      ALTER TABLE vehicles 
      ADD CONSTRAINT fk_vehicle_customer 
      FOREIGN KEY (customer_id) 
      REFERENCES customers(id) 
      ON DELETE CASCADE
    `);

    // 3. Reset the sequence so next customer gets ID 2
    console.log("Resetting sequences...");
    await client.query("SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers))");

    await client.query("COMMIT");
    console.log("Database IDs fixed successfully!");
  } catch(e) {
    await client.query("ROLLBACK");
    console.error("Error:", e);
  } finally {
    client.release();
    pool.end();
  }
}

fixDB();
