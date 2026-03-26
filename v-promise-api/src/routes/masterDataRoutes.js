import { Router } from "express";
import { getMasterData } from "../controllers/masterDataController.js";

const router = Router();

router.get("/api/master-data", getMasterData);

export default router;
