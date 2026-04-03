import pool from './src/config/db.js';

async function deleteData() {
    try {
        console.log("Deleting ALL TEST CUSTOMERS from previous examples (Rahul Sharma, Vikram Singh)...");
        await pool.query("DELETE FROM customers WHERE name IN ('Rahul Sharma', 'Vikram Singh')");
        
        console.log("Deleting P. SRINIVASA RAO if they were inserted with NaN...");
        await pool.query("DELETE FROM customers WHERE name = 'P. SRINIVASA RAO'");
        await pool.query("DELETE FROM vehicles WHERE registration_number = 'AP31BK4582'");
        
        console.log("Done.");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        pool.end();
    }
}

deleteData();
