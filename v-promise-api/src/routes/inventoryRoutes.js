import { Router } from "express";
import { getInventory, addToInventory, syncApprovedToInventory } from "../controllers/inventoryController.js";

const router = Router();

router.get("/api/inventory", getInventory);
router.post("/api/inventory", addToInventory);
router.post("/api/inventory/sync", syncApprovedToInventory);

export default router;
