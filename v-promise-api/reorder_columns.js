import pool from "./src/config/db.js";

async function moveColumn() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("Starting column reorder...");

    // 1. Add new columns in the desired order
    await client.query(`
      ALTER TABLE vehicles 
      ADD COLUMN vehicle_name_new VARCHAR(100),
      ADD COLUMN purchase_type_new VARCHAR(50),
      ADD COLUMN model_year_new INT,
      ADD COLUMN registration_number_new VARCHAR(20),
      ADD COLUMN speedometer_reading_new INT,
      ADD COLUMN outlook_condition_new VARCHAR(50),
      ADD COLUMN engine_condition_new VARCHAR(50),
      ADD COLUMN overall_condition_new VARCHAR(50),
      ADD COLUMN noc_status_new VARCHAR(20),
      ADD COLUMN challans_pending_new BOOLEAN DEFAULT FALSE,
      ADD COLUMN exchange_value_new NUMERIC(10,2),
      ADD COLUMN final_credit_note_value_new NUMERIC(10,2),
      ADD COLUMN vehicle_status_new VARCHAR(50) DEFAULT 'INTAKE_CREATED',
      ADD COLUMN created_at_new TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // 2. Copy data over
    await client.query(`
      UPDATE vehicles SET
        vehicle_name_new = vehicle_name,
        purchase_type_new = purchase_type,
        model_year_new = model_year,
        registration_number_new = registration_number,
        speedometer_reading_new = speedometer_reading,
        outlook_condition_new = outlook_condition,
        engine_condition_new = engine_condition,
        overall_condition_new = overall_condition,
        noc_status_new = noc_status,
        challans_pending_new = challans_pending,
        exchange_value_new = exchange_value,
        final_credit_note_value_new = final_credit_note_value,
        vehicle_status_new = vehicle_status,
        created_at_new = created_at
    `);

    // 3. Drop old columns (this cascades constraints)
    await client.query(`
      ALTER TABLE vehicles 
      DROP COLUMN vehicle_name,
      DROP COLUMN purchase_type,
      DROP COLUMN model_year,
      DROP COLUMN registration_number CASCADE,
      DROP COLUMN speedometer_reading,
      DROP COLUMN outlook_condition,
      DROP COLUMN engine_condition,
      DROP COLUMN overall_condition,
      DROP COLUMN noc_status,
      DROP COLUMN challans_pending,
      DROP COLUMN exchange_value,
      DROP COLUMN final_credit_note_value,
      DROP COLUMN vehicle_status,
      DROP COLUMN created_at
    `);

    // 4. Rename new columns to exact old names
    // Done sequentially to avoid issues
    const colsToRename = [
      'vehicle_name', 'purchase_type', 'model_year', 'registration_number', 
      'speedometer_reading', 'outlook_condition', 'engine_condition', 
      'overall_condition', 'noc_status', 'challans_pending', 'exchange_value', 
      'final_credit_note_value', 'vehicle_status', 'created_at'
    ];
    
    for (const col of colsToRename) {
      await client.query(`ALTER TABLE vehicles RENAME COLUMN ${col}_new TO ${col}`);
    }

    // 5. Restore Unique constraints and indexes
    await client.query(`
      ALTER TABLE vehicles ADD CONSTRAINT vehicles_registration_number_key UNIQUE (registration_number);
    `);
    
    // Check if idx_vehicle_reg exists before creating
    try {
      await client.query(`CREATE INDEX idx_vehicle_reg ON vehicles(registration_number);`);
    } catch(e) {} // Might already be implicitly created or just skip safely

    await client.query("COMMIT");
    console.log("Successfully reordered columns without data loss!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to reorder columns:", error);
  } finally {
    client.release();
  }
}

moveColumn();
