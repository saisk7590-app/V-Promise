import pool from "../../config/db.js";

export const getAllBranches = async () => {
    const query = "SELECT * FROM branches ORDER BY created_at DESC";
    const { rows } = await pool.query(query);
    return rows;
};

export const createBranch = async (data) => {
    const { name, city } = data;
    const query = "INSERT INTO branches (name, city) VALUES ($1, $2) RETURNING *";
    const { rows } = await pool.query(query, [name, city]);
    return rows[0];
};

export const updateBranch = async (id, data) => {
    const { name, city } = data;
    const query = `
        UPDATE branches 
        SET name = COALESCE($1, name), 
            city = COALESCE($2, city), 
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = $3 
        RETURNING *
    `;
    const { rows } = await pool.query(query, [name, city, id]);
    return rows[0];
};

export const updateBranchStatus = async (id, status) => {
    const query = "UPDATE branches SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *";
    const { rows } = await pool.query(query, [status, id]);
    return rows[0];
};
