import { Router } from "express";
import { getVehiclesForInspection, createVehicleInspection } from "../controllers/inspectionController.js";
import upload from "../middleware/upload.js";

const router = Router();

router.get("/api/vehicles-pending", getVehiclesForInspection);
router.post("/api/vehicle-inspection", upload.array("images", 10), createVehicleInspection);

export default router;
