import { Router } from "express";
import { getInventory, addToInventory } from "../controllers/inventoryController.js";

const router = Router();

router.get("/api/inventory", getInventory);
router.post("/api/inventory", addToInventory);

export default router;
