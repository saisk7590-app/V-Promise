import pool from "../config/db.js";

export const getInventory = async (_req, res) => {
  try {
    const query = `
      SELECT 
        v.registration_number as name,
        v.model_year,
        vi.listing_price as price,
        (SELECT image_path FROM inspection_images WHERE inspection_id = vv.inspection_id LIMIT 1) as thumbnail
      FROM vehicle_inventory vi
      JOIN vehicles v ON vi.vehicle_id = v.id
      JOIN vehicle_valuations vv ON vi.valuation_id = vv.id
      WHERE vi.status = 'AVAILABLE' AND vi.is_active = true
      ORDER BY vi.created_at DESC
    `;
    const { rows } = await pool.query(query);
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
