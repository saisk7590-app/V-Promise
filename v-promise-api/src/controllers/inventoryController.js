import pool from "../config/db.js";

export const getInventory = async (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // Auto-sync: Insert any missing APPROVED valuations into inventory automatically
    await pool.query(`
      INSERT INTO vehicle_inventory (vehicle_id, valuation_id, listing_price, status, is_active)
      SELECT vv.vehicle_id, vv.id, vv.final_price, 'AVAILABLE', true
      FROM vehicle_valuations vv
      LEFT JOIN vehicle_inventory vi ON vi.valuation_id = vv.id
      WHERE vv.status = 'APPROVED' AND vi.id IS NULL
    `);

    // Ensure main vehicle status reflects inventory
    await pool.query(`
      UPDATE vehicles v
      SET vehicle_status = 'IN_INVENTORY'
      FROM vehicle_inventory vi
      WHERE v.id = vi.vehicle_id AND v.vehicle_status != 'IN_INVENTORY'
    `);

    const { rows } = await pool.query(
      `SELECT
        vi.id AS inventory_id,
        v.vehicle_name,
        v.vehicle_type,
        v.registration_number,
        v.model_year,
        v.speedometer_reading,
        v.overall_condition,
        vi.listing_price AS price,
        (
          SELECT image_path
          FROM vehicle_images
          WHERE vehicle_id = v.id
          ORDER BY image_order ASC
          LIMIT 1
        ) AS thumbnail

      FROM vehicle_inventory vi
      JOIN vehicles v ON vi.vehicle_id = v.id

      WHERE vi.status = 'AVAILABLE' AND vi.is_active = true
        AND (
          $1::text IS NULL OR
          v.vehicle_name ILIKE '%' || $1 || '%' OR
          v.vehicle_type ILIKE '%' || $1 || '%' OR
          v.registration_number ILIKE '%' || $1 || '%' OR
          CAST(v.model_year AS TEXT) ILIKE '%' || $1 || '%' OR
          CAST(vi.listing_price AS TEXT) ILIKE '%' || $1 || '%'
        )

      ORDER BY vi.created_at DESC
      LIMIT $2 OFFSET $3`,
      [search || null, limit, offset]
    );

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Fetch inventory error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch inventory" });
  }
};

export const addToInventory = async (req, res) => {
  const { vehicleId, valuationId, listingPrice } = req.body;

  if (!vehicleId || !valuationId || !listingPrice) {
    return res.status(400).json({ success: false, message: "Vehicle ID, Valuation ID, and Listing Price are required." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insert into vehicle_inventory
    const inventoryQuery = `
      INSERT INTO vehicle_inventory (
        vehicle_id, 
        valuation_id, 
        listing_price, 
        status, 
        is_active
      ) VALUES ($1, $2, $3, $4, $5) RETURNING id
    `;
    const inventoryRes = await client.query(inventoryQuery, [
      vehicleId,
      valuationId,
      listingPrice,
      'AVAILABLE',
      true
    ]);

    // Update vehicle status
    await client.query(
      "UPDATE vehicles SET vehicle_status = 'IN_INVENTORY' WHERE id = $1",
      [vehicleId]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      inventoryId: inventoryRes.rows[0].id,
      message: "Vehicle moved to inventory successfully"
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Add to inventory error:", error);
    return res.status(500).json({ success: false, message: "Failed to move vehicle to inventory" });
  } finally {
    client.release();
  }
};

// Sync all APPROVED valuations that are missing from vehicle_inventory
export const syncApprovedToInventory = async (_req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Find approved valuations that have no inventory entry
    const missingQuery = `
      SELECT vv.id as valuation_id, vv.vehicle_id, vv.final_price
      FROM vehicle_valuations vv
      LEFT JOIN vehicle_inventory vi ON vi.valuation_id = vv.id
      WHERE vv.status = 'APPROVED' AND vi.id IS NULL
    `;
    const { rows: missing } = await client.query(missingQuery);

    let synced = 0;
    for (const row of missing) {
      await client.query(
        `INSERT INTO vehicle_inventory (vehicle_id, valuation_id, listing_price, status, is_active)
         VALUES ($1, $2, $3, 'AVAILABLE', true)`,
        [row.vehicle_id, row.valuation_id, row.final_price]
      );
      await client.query(
        "UPDATE vehicles SET vehicle_status = 'IN_INVENTORY' WHERE id = $1",
        [row.vehicle_id]
      );
      synced++;
    }

    await client.query("COMMIT");

    return res.json({
      success: true,
      message: `Synced ${synced} approved valuation(s) to inventory`,
      syncedCount: synced
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Sync inventory error:", error);
    return res.status(500).json({ success: false, message: "Failed to sync inventory" });
  } finally {
    client.release();
  }
};

