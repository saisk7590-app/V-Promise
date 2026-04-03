import pool from './src/config/db.js';

async function fixVehicleTable() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    // 1. Fetch current vehicles
    const res = await client.query("SELECT id, vehicle_name FROM vehicles ORDER BY id");
    console.log("Current Vehicles before fix:", res.rows);

    let maxId = 1;
    for (const v of res.rows) {
      if (v.id === 5) {
        console.log("Found vehicle with ID 5. Changing to 2...");
        // Disable foreign key checks if any depend on vehicle.id (like images, inspections)
        // Actually, we can use ON UPDATE CASCADE but let's see if there are dependencies
        await client.query("ALTER TABLE vehicle_images DROP CONSTRAINT vehicle_images_vehicle_id_fkey");
        await client.query("ALTER TABLE vehicle_inspections DROP CONSTRAINT vehicle_inspections_vehicle_id_fkey");
        await client.query("ALTER TABLE vehicle_valuations DROP CONSTRAINT vehicle_valuations_vehicle_id_fkey");
        await client.query("ALTER TABLE vehicle_inventory DROP CONSTRAINT vehicle_inventory_vehicle_id_fkey");
        
        // Update the main vehicle
        await client.query("UPDATE vehicles SET id = 2 WHERE id = 5");
        
        // Update references
        await client.query("UPDATE vehicle_images SET vehicle_id = 2 WHERE vehicle_id = 5");
        await client.query("UPDATE vehicle_inspections SET vehicle_id = 2 WHERE vehicle_id = 5");
        await client.query("UPDATE vehicle_valuations SET vehicle_id = 2 WHERE vehicle_id = 5");
        await client.query("UPDATE vehicle_inventory SET vehicle_id = 2 WHERE vehicle_id = 5");

        // Restore constraints with ON DELETE CASCADE
        await client.query("ALTER TABLE vehicle_images ADD CONSTRAINT vehicle_images_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE");
        await client.query("ALTER TABLE vehicle_inspections ADD CONSTRAINT vehicle_inspections_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE");
        await client.query("ALTER TABLE vehicle_valuations ADD CONSTRAINT vehicle_valuations_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE");
        await client.query("ALTER TABLE vehicle_inventory ADD CONSTRAINT vehicle_inventory_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE");
        
        maxId = 2;
      }
    }

    // 2. Reset sequence based on max ID
    console.log("Resetting vehicles sequence...");
    await client.query("SELECT setval('vehicles_id_seq', (SELECT COALESCE(MAX(id), 1) FROM vehicles))");

    await client.query("COMMIT");
    console.log("Vehicle ID and sequence fixed successfully!");
  } catch(e) {
    await client.query("ROLLBACK");
    console.error("Error:", e);
  } finally {
    client.release();
    pool.end();
  }
}

fixVehicleTable();
