import pool from "../../config/db.js";
import bcrypt from "bcrypt";

export const createUser = async (data) => {
    const { name, email, password, role, branch_id } = data;
    const password_hash = await bcrypt.hash(password, 10);
    
    const query = `
        INSERT INTO users (name, email, password_hash, role, branch_id, status) 
        VALUES ($1, $2, $3, $4, $5, 'ACTIVE') 
        RETURNING id, name, email, role, branch_id, status
    `;
    const { rows } = await pool.query(query, [name, email, password_hash, role, branch_id]);
    return rows[0];
};

export const getAllUsers = async (filters = {}) => {
    const { status, role } = filters;
    let query = `
        SELECT u.id, u.name, u.email, u.role, u.status, b.name as branch, u.created_at 
        FROM users u 
        LEFT JOIN branches b ON u.branch_id = b.id
        WHERE 1=1
    `;
    const params = [];

    if (status) {
        params.push(status);
        query += ` AND u.status = $${params.length}`;
    }

    if (role) {
        params.push(role);
        query += ` AND u.role = $${params.length}`;
    }

    query += " ORDER BY u.created_at DESC";

    const { rows } = await pool.query(query, params);
    return rows;
};

export const updateUser = async (id, data) => {
    const { name, email, role, branch_id } = data;
    const query = `
        UPDATE users 
        SET name = COALESCE($1, name), 
            email = COALESCE($2, email), 
            role = COALESCE($3, role), 
            branch_id = COALESCE($4, branch_id),
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = $5 
        RETURNING id, name, email, role, status, branch_id
    `;
    const { rows } = await pool.query(query, [name, email, role, branch_id, id]);
    return rows[0];
};

export const updateUserStatus = async (id, status) => {
    const query = "UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status";
    const { rows } = await pool.query(query, [status, id]);
    return rows[0];
};
