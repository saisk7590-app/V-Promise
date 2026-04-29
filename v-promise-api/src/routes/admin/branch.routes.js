import { Router } from "express";
import * as branchController from "../../controllers/admin/branch.controller.js";
import { verifyAuth } from "../../middleware/authMiddleware.js";
import { checkAdmin } from "../../middleware/admin.middleware.js";
import { validateBranch, validateBranchUpdate } from "../../middleware/adminValidation.js";

const router = Router();

// All routes require authentication and admin access
router.use(verifyAuth, checkAdmin);

router.get("/", branchController.getBranches);
router.post("/", validateBranch, branchController.createBranch);
router.put("/:id", validateBranchUpdate, branchController.updateBranch);
router.patch("/:id/status", branchController.updateStatus);

export default router;
