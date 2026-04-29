import { Router } from "express";
import * as userController from "../../controllers/admin/user.controller.js";
import { verifyAuth } from "../../middleware/authMiddleware.js";
import { checkAdmin } from "../../middleware/admin.middleware.js";
import { validateUserUpdate, validateUserStatus, validateUserCreation } from "../../middleware/adminValidation.js";

const router = Router();

router.use(verifyAuth, checkAdmin);

router.get("/", userController.getUsers);
router.post("/", validateUserCreation, userController.createUser);
router.put("/:id", validateUserUpdate, userController.updateUser);
router.put("/:id/status", validateUserStatus, userController.updateStatus);

export default router;
