import { Router } from "express";
import { createVehicleIntake, getBranches } from "../controllers/vehicleController.js";
import upload from "../middleware/upload.js";

const router = Router();

router.get("/api/branches", getBranches);
router.post("/api/vehicle-intake", upload.array("images"), createVehicleIntake);

export default router;
