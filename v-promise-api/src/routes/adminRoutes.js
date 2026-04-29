import { Router } from "express";
import { getUsers, createUser, getBranches, createBranch, getRoles } from "../controllers/adminController.js";

const router = Router();

router.get("/admin/users", getUsers);
router.post("/admin/users", createUser);
router.get("/admin/branches", getBranches);
router.post("/admin/branches", createBranch);
router.get("/admin/roles", getRoles);

export default router;
