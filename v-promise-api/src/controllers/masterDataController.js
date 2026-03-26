import pool from "../config/db.js";

export const getMasterData = async (req, res) => {
  try {
    // 1. Ensure table exists dynamically if it wasn't added yet
    await pool.query(`
      CREATE TABLE IF NOT EXISTS master_options (
        id SERIAL PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        label VARCHAR(100) NOT NULL,
        value VARCHAR(100) NOT NULL UNIQUE
      );
    `);

    // 2. Auto-seed essential master data if table is empty
    const { rows: existingRows } = await pool.query("SELECT COUNT(*) FROM master_options");
    if (parseInt(existingRows[0].count) === 0) {
      await pool.query(`
        INSERT INTO master_options (category, label, value) VALUES
        ('VEHICLE_TYPE', '2 Wheeler', '2W'),
        ('VEHICLE_TYPE', '4 Wheeler', '4W'),
        ('VEHICLE_TYPE', 'Commercial', 'COMM'),
        ('CONDITION', 'Excellent', 'EXCELLENT'),
        ('CONDITION', 'Good', 'GOOD'),
        ('CONDITION', 'Average', 'AVERAGE'),
        ('CONDITION', 'Poor', 'POOR'),
        ('PURCHASE_TYPE', 'Direct', 'DIRECT'),
        ('PURCHASE_TYPE', 'Exchange', 'EXCHANGE'),
        ('PURCHASE_TYPE', 'Dealer', 'DEALER')
        ON CONFLICT (value) DO NOTHING;
      `);
    }

    // 3. Fetch from Postgres
    const { rows } = await pool.query("SELECT category, label, value FROM master_options");
    
    // 4. Format for the React Native App
    const data = {
      vehicleTypes: rows.filter(r => r.category === 'VEHICLE_TYPE').map(r => ({ label: r.label, value: r.value })),
      conditions: rows.filter(r => r.category === 'CONDITION').map(r => ({ label: r.label, value: r.value })),
      purchaseTypes: rows.filter(r => r.category === 'PURCHASE_TYPE').map(r => ({ label: r.label, value: r.value }))
    };

    res.json(data);
  } catch (error) {
    console.error("Error fetching master data:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
};
