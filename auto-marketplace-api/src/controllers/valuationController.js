import pool from "../config/db.js";

export const getVehiclesReadyForValuation = async (_req, res) => {
  try {
    const query = `
      SELECT v.id, v.registration_number, v.vehicle_type, v.model_year 
      FROM vehicles v
      WHERE v.vehicle_status = 'INSPECTED'
      ORDER BY v.created_at DESC
    `;
    const { rows } = await pool.query(query);
    return res.json(rows);
  } catch (error) {
    console.error("Fetch vehicles for valuation error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getVehicleFullDetails = async (req, res) => {
  const { vehicle_id } = req.params;

  try {
    // 1. Fetch Vehicle and Customer details
    const vehicleQuery = `
      SELECT v.*, c.name as customer_name, c.primary_mobile
      FROM vehicles v
      JOIN customers c ON v.customer_id = c.id
      WHERE v.id = $1
    `;
    const vehicleRes = await pool.query(vehicleQuery, [vehicle_id]);

    if (vehicleRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }

    // 2. Fetch Latest Inspection
    const inspectionQuery = `
      SELECT * FROM vehicle_inspections
      WHERE vehicle_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const inspectionRes = await pool.query(inspectionQuery, [vehicle_id]);
    const inspection = inspectionRes.rows[0] || null;

    // 3. Fetch Inspection Images if inspection exists
    let images = [];
    if (inspection) {
      const imagesQuery = "SELECT id, image_path FROM inspection_images WHERE inspection_id = $1";
      const imagesRes = await pool.query(imagesQuery, [inspection.id]);
      images = imagesRes.rows;
    }

    return res.json({
      success: true,
      vehicle: vehicleRes.rows[0],
      inspection,
      images
    });

  } catch (error) {
    console.error("Fetch full details error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createValuation = async (req, res) => {
  const { vehicleId, inspectionId, evaluatedBy, finalPrice, priceReason } = req.body;

  if (!vehicleId || !inspectionId || !finalPrice) {
    return res.status(400).json({ success: false, message: "Vehicle ID, Inspection ID, and Final Price are required." });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Insert into vehicle_valuations
    // Note: The existing table has base_price and status. We'll reuse base_price as the evaluated price if needed, 
    // but the prompt asks for final_price.
    const valuationQuery = `
      INSERT INTO vehicle_valuations (
        vehicle_id, 
        inspection_id, 
        evaluated_by, 
        final_price, 
        price_reason,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
    `;
    const valuationRes = await client.query(valuationQuery, [
      vehicleId,
      inspectionId,
      evaluatedBy || 1, // Default to admin 1
      finalPrice,
      priceReason || null,
      'PENDING_APPROVAL'
    ]);

    // Update vehicle status
    await client.query(
      "UPDATE vehicles SET vehicle_status = 'VALUATED' WHERE id = $1",
      [vehicleId]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      valuationId: valuationRes.rows[0].id,
      message: "Valuation submitted successfully"
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Valuation submission error:", error);
    return res.status(500).json({ success: false, message: "Failed to submit valuation" });
  } finally {
    client.release();
  }
};

export const updateValuationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id || !status) {
    return res.status(400).json({ success: false, message: "Valuation ID and status are required." });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Update valuation status
    const updateValuationQuery = `
      UPDATE vehicle_valuations 
      SET status = $1 
      WHERE id = $2 
      RETURNING *
    `;
    const valuationRes = await client.query(updateValuationQuery, [status, id]);

    if (valuationRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Valuation not found" });
    }

    const valuation = valuationRes.rows[0];

    // 2. If status is APPROVED, move to inventory
    if (status === 'APPROVED') {
      // Check if already in inventory
      const checkInventoryQuery = "SELECT id FROM vehicle_inventory WHERE valuation_id = $1";
      const checkInventoryRes = await client.query(checkInventoryQuery, [id]);

      if (checkInventoryRes.rows.length === 0) {
        // Insert into vehicle_inventory
        const insertInventoryQuery = `
          INSERT INTO vehicle_inventory (
            vehicle_id, 
            valuation_id, 
            listing_price, 
            status, 
            is_active
          ) VALUES ($1, $2, $3, 'AVAILABLE', true)
        `;
        await client.query(insertInventoryQuery, [
          valuation.vehicle_id,
          id,
          valuation.final_price
        ]);
      } else {
        // Reactivate existing inventory record
        const reactivateInventoryQuery = `
          UPDATE vehicle_inventory 
          SET is_active = true, status = 'AVAILABLE' 
          WHERE valuation_id = $1
        `;
        await client.query(reactivateInventoryQuery, [id]);
      }

      // Ensure vehicle status is updated
      await client.query(
        "UPDATE vehicles SET vehicle_status = 'IN_INVENTORY' WHERE id = $1",
        [valuation.vehicle_id]
      );
    } 
    // 3. Optional: Handle rejection (deactivate inventory if exists)
    else if (status === 'REJECTED') {
      await client.query(
        "UPDATE vehicle_inventory SET is_active = false WHERE valuation_id = $1",
        [id]
      );
    }

    await client.query("COMMIT");

    return res.json({
      success: true,
      message: `Valuation status updated to ${status} successfully`,
      data: valuation
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Update valuation status error:", error);
    return res.status(500).json({ success: false, message: "Failed to update valuation status" });
  } finally {
    client.release();
  }
};
