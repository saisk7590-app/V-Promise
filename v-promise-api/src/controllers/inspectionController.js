import fs from "fs";
import path from "path";
import pool from "../config/db.js";

export const getVehiclesForInspection = async (_req, res) => {
  try {
    // Fetch vehicles that don't have an inspection record yet
    const query = `
      SELECT v.id, v.registration_number, v.vehicle_name, v.model_year, v.vehicle_type
      FROM vehicles v
      LEFT JOIN vehicle_inspections vi ON v.id = vi.vehicle_id
      WHERE vi.id IS NULL
      ORDER BY v.created_at DESC
    `;
    const { rows } = await pool.query(query);
    return res.json(rows);
  } catch (error) {
    console.error("Fetch pending vehicles error", error);
    return res.status(500).json({ success: false, message: "Unable to fetch pending vehicles" });
  }
};

const getScore = (value) => {
  const scores = {
    EXCELLENT: 4,
    GOOD: 3,
    AVERAGE: 2,
    POOR: 1,
    BAD: 1, // Mapping BAD from frontend to POOR score
  };
  return scores[String(value).toUpperCase()] || 0;
};

const getGradeFromScore = (avg) => {
  if (avg >= 3.5) return "EXCELLENT";
  if (avg >= 2.5) return "GOOD";
  if (avg >= 1.5) return "AVERAGE";
  return "POOR";
};

export const createVehicleInspection = async (req, res) => {
  const client = await pool.connect();

  const {
    vehicleId,
    inspectedBy, // This should come from auth, but using from body for now as per project pattern
    engineHealth,
    outlook,
    structuralCondition,
    mechanicalCondition,
    electricalCondition,
    remarks,
  } = req.body;

  if (!vehicleId || !engineHealth || !outlook || !structuralCondition || !mechanicalCondition || !electricalCondition) {
    return res.status(400).json({ success: false, message: "Missing required inspection fields." });
  }

  // Calculate overall grade
  const fields = [
    engineHealth,
    outlook,
    structuralCondition,
    mechanicalCondition,
    electricalCondition,
  ];
  const totalScore = fields.reduce((sum, val) => sum + getScore(val), 0);
  const averageScore = totalScore / fields.length;
  const overallGrade = getGradeFromScore(averageScore);

  console.log(`Inspection calculation: Total=${totalScore}, Avg=${averageScore}, Grade=${overallGrade}`);

  try {
    await client.query("BEGIN");

    // Insert into vehicle_inspections including overall_grade
    const inspectionResult = await client.query(
      `INSERT INTO vehicle_inspections (
        vehicle_id,
        inspected_by,
        engine_health,
        outlook,
        structural_condition,
        mechanical_condition,
        electrical_condition,
        overall_grade,
        remarks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        Number(vehicleId),
        inspectedBy ? Number(inspectedBy) : 1, // Default to admin 1 if not provided
        engineHealth,
        outlook,
        structuralCondition,
        mechanicalCondition,
        electricalCondition,
        overallGrade,
        remarks || null
      ]
    );

    const inspectionId = inspectionResult.rows[0].id;

    // Update vehicle status
    await client.query(
      "UPDATE vehicles SET vehicle_status = 'INSPECTED' WHERE id = $1",
      [Number(vehicleId)]
    );

    const files = req.files || [];

    if (files.length > 0) {
      const inspectionDir = path.join(process.cwd(), "uploads", "inspections", String(inspectionId));
      await fs.promises.mkdir(inspectionDir, { recursive: true });

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `${Date.now()}_${i + 1}.jpg`;
        const filePath = path.join(inspectionDir, fileName);
        
        await fs.promises.writeFile(filePath, file.buffer);

        const relativePath = `uploads/inspections/${inspectionId}/${fileName}`;
        await client.query(
          `INSERT INTO inspection_images (inspection_id, image_path) VALUES ($1, $2)`,
          [inspectionId, relativePath]
        );
      }
    }

    await client.query("COMMIT");
    
    return res.status(201).json({ 
      success: true, 
      inspectionId, 
      overallGrade,
      message: "Vehicle inspection saved successfully" 
    });

  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("Vehicle inspection transaction failed:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Processing failed. Please try again.", 
      error: error.message 
    });
  } finally {
    if (client) client.release();
  }
};
