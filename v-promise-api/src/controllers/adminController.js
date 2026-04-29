import pool from "../config/db.js";
import bcrypt from "bcrypt";

// Get all users
export const getUsers = async (req, res) => {
    try {
        const query = `
            SELECT u.id, u.name, u.email, r.role_name as role, b.branch_name as branch 
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN branches b ON u.branch_id = b.id
            ORDER BY u.created_at DESC;
        `;
        const { rows } = await pool.query(query);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (e) {
        console.error("Error fetching users:", e);
        res.status(500).json({ success: false, message: "Database Error" });
    }
};

// Create a new user
export const createUser = async (req, res) => {
    const { name, email, password, role_id, branch_id } = req.body;

    if (!name || !email || !password || !role_id) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
        const checkEmail = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (checkEmail.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        const hashedPass = await bcrypt.hash(password, 10);

        const insertQuery = `
            INSERT INTO users (name, email, password, role_id, branch_id) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id, name, email;
        `;
        const values = [name, email, hashedPass, role_id, branch_id || null];
        const { rows } = await pool.query(insertQuery, values);

        res.status(201).json({ success: true, data: rows[0] });
    } catch (e) {
        console.error("Error creating user:", e);
        res.status(500).json({ success: false, message: "Database Error" });
    }
};

// Get all branches
export const getBranches = async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT id, branch_name as name, city FROM branches ORDER BY created_at DESC;");
        res.json({ success: true, count: rows.length, data: rows });
    } catch (e) {
        console.error("Error fetching branches:", e);
        res.status(500).json({ success: false, message: "Database Error" });
    }
};

// Create branch
export const createBranch = async (req, res) => {
    const { branch_name, city } = req.body;
    if (!branch_name) {
        return res.status(400).json({ success: false, message: "Branch name is required" });
    }

    try {
        const checkBranch = await pool.query("SELECT id FROM branches WHERE branch_name = $1", [branch_name]);
        if (checkBranch.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Branch already exists" });
        }

        const { rows } = await pool.query(
            "INSERT INTO branches (branch_name, city) VALUES ($1, $2) RETURNING id, branch_name as name, city;",
            [branch_name, city]
        );
        res.status(201).json({ success: true, data: rows[0] });
    } catch (e) {
        console.error("Error creating branch:", e);
        res.status(500).json({ success: false, message: "Database Error" });
    }
};

// Get roles
export const getRoles = async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT id, role_name FROM roles ORDER BY id ASC;");
        res.json({ success: true, data: rows });
    } catch (e) {
        console.error("Error fetching roles:", e);
        res.status(500).json({ success: false, message: "Database Error" });
    }
};
