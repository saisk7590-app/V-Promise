import fs from "fs";
import path from "path";
import pool from "../config/db.js";

export const getBranches = async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, branch_name FROM branches ORDER BY branch_name");
    return res.json(rows);
  } catch (error) {
    console.error("Branch list error", error);
    return res.status(500).json({ success: false, message: "Unable to fetch branches" });
  }
};

export const createVehicleIntake = async (req, res) => {
  const client = await pool.connect();

  const {
    customerName,
    primaryMobile,
    secondaryMobile,
    branchId,
    branchName, // New: from manual entry
    vehicleType,
    purchaseType,
    modelYear,
    registrationNumber,
    speedometerReading,
    outlookCondition,
    engineCondition,
    overallCondition,
    nocStatus,
    challansPending,
    exchangeValue,
    finalCreditNoteValue,
  } = req.body;

  if (!customerName || !primaryMobile || (!branchId && !branchName)) {
    return res.status(400).json({ success: false, message: "Customer name, primary mobile, and branch are required." });
  }

  try {
    await client.query("BEGIN");

    let finalBranchId = branchId;

    // Handle manual branch entry or lookup by name if ID is missing/manual
    if (branchId === "manual" || !branchId) {
      if (!branchName) {
        return res.status(400).json({ success: false, message: "Branch name is required for manual entry." });
      }
      const branchRes = await client.query(
        "INSERT INTO branches (branch_name) VALUES ($1) ON CONFLICT (branch_name) DO UPDATE SET branch_name = EXCLUDED.branch_name RETURNING id",
        [branchName]
      );
      finalBranchId = branchRes.rows[0].id;
    } else {
      // PROACTIVE FIX: Verify the provided branchId actually exists to avoid FK violation
      const checkBranch = await client.query("SELECT id FROM branches WHERE id = $1", [Number(branchId)]);
      if (checkBranch.rows.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Branch ID ${branchId} no longer exists. Please refresh the branch list in the app.` 
        });
      }
    }

    const customerResult = await client.query(
      `INSERT INTO customers (name, primary_mobile, secondary_mobile, branch_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [customerName, primaryMobile, secondaryMobile || null, Number(finalBranchId)]
    );

    const customerId = customerResult.rows[0].id;

    let vehicleId = null;
    if (vehicleType) {
      const vehicleResult = await client.query(
        `INSERT INTO vehicles (
          customer_id,
          created_by,
          vehicle_type,
          purchase_type,
          model_year,
          registration_number,
          speedometer_reading,
          outlook_condition,
          engine_condition,
          overall_condition,
          noc_status,
          challans_pending,
          exchange_value,
          final_credit_note_value
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
        [
          customerId,
          1, // Defaulting to Admin (id: 1) for now
          vehicleType,
          purchaseType,
          modelYear ? Number(modelYear) : null,
          registrationNumber,
          speedometerReading ? Number(speedometerReading) : null,
          outlookCondition,
          engineCondition,
          overallCondition,
          nocStatus,
          challansPending === "true" || challansPending === true,
          exchangeValue ? Number(exchangeValue) : null,
          finalCreditNoteValue ? Number(finalCreditNoteValue) : null,
        ]
      );
      vehicleId = vehicleResult.rows[0].id;
    }

    const files = req.files || [];

    if (vehicleId && files.length) {
      const vehicleDir = path.join(process.cwd(), "uploads", "vehicles", String(vehicleId));
      await fs.promises.mkdir(vehicleDir, { recursive: true });

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Use exact index-based naming as requested: 1.jpg, 2.jpg, etc.
        const fileName = `${i + 1}.jpg`; 
        const filePath = path.join(vehicleDir, fileName);
        
        await fs.promises.writeFile(filePath, file.buffer);

        // Save path relative to project root for easy serving
        const relativePath = `uploads/vehicles/${vehicleId}/${fileName}`;
        await client.query(
          `INSERT INTO vehicle_images (vehicle_id, image_path, image_order) VALUES ($1, $2, $3)`,
          [vehicleId, relativePath, i + 1]
        );
      }
    }

    await client.query("COMMIT");
    console.log(`Success: Vehicle Intake completed for Customer ID: ${customerId}, Vehicle ID: ${vehicleId}`);
    return res.status(201).json({ 
      success: true, 
      vehicleId, 
      customerId, 
      message: "Vehicle intake saved successfully" 
    });

  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("CRITICAL: Vehicle intake transaction failed:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Processing failed. Please try again.", 
      error: error.message 
    });
  } finally {
    if (client) client.release();
  }
};
