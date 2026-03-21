import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    try {
        const query = {
            text: `SELECT u.id, u.name, u.email, u.password, r.role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = $1`,
            values: [email],
        };

        const { rows } = await pool.query(query);

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET not configured");
            return res.status(500).json({ success: false, message: "Server configuration error" });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role_name
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role_name } });
    } catch (error) {
        console.error("Login error", error);
        const message = process.env.NODE_ENV === 'production' ? 'Server error' : error.message;
        return res.status(500).json({ success: false, message });
    }
};