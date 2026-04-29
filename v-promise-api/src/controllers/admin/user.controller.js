import * as userService from "../../services/admin/user.service.js";

export const getUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers(req.query);
        res.status(200).json({ success: true, message: "Users retrieved", data: users });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

export const createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json({ success: true, message: "User created successfully", data: user });
    } catch (e) {
        if (e.code === '23505') {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }
        res.status(500).json({ success: false, message: e.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, message: "User updated", data: user });
    } catch (e) {
        if (e.code === '23505') {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }
        res.status(500).json({ success: false, message: e.message });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const user = await userService.updateUserStatus(req.params.id, req.body.status);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, message: "User status updated", data: user });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
