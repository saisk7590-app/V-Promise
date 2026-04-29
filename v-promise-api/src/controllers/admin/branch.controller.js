import * as branchService from "../../services/admin/branch.service.js";

export const getBranches = async (req, res) => {
    try {
        const branches = await branchService.getAllBranches();
        res.status(200).json({ success: true, message: "Branches retrieved", data: branches });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

export const createBranch = async (req, res) => {
    try {
        const branch = await branchService.createBranch(req.body);
        res.status(201).json({ success: true, message: "Branch created", data: branch });
    } catch (e) {
        if (e.code === '23505') {
            return res.status(400).json({ success: false, message: "Branch with this name and city already exists." });
        }
        res.status(500).json({ success: false, message: e.message });
    }
};

export const updateBranch = async (req, res) => {
    try {
        const branch = await branchService.updateBranch(req.params.id, req.body);
        if (!branch) {
            return res.status(404).json({ success: false, message: "Branch not found" });
        }
        res.status(200).json({ success: true, message: "Branch updated", data: branch });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const branch = await branchService.updateBranchStatus(req.params.id, req.body.status);
        if (!branch) {
            return res.status(404).json({ success: false, message: "Branch not found" });
        }
        res.status(200).json({ success: true, message: "Branch status updated", data: branch });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
