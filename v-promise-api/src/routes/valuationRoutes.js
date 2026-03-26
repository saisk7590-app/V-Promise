import { Router } from "express";
import { getVehicleFullDetails, createValuation, getVehiclesReadyForValuation, updateValuationStatus } from "../controllers/valuationController.js";

const router = Router();

router.get("/api/vehicles-for-valuation", getVehiclesReadyForValuation);
router.get("/api/vehicle-full-details/:vehicle_id", getVehicleFullDetails);
router.post("/api/vehicle-valuation", createValuation);
router.put("/api/valuation/:id", updateValuationStatus);

export default router;
