import pool from './src/config/db.js';

async function checkData() {
  try {
    const customers = await pool.query("SELECT * FROM customers ORDER BY id");
    console.log("Customers:", customers.rows);
    
    const vehicles = await pool.query("SELECT id, customer_id, vehicle_name, vehicle_type FROM vehicles ORDER BY id");
    console.log("Vehicles:", vehicles.rows);
    
    const images = await pool.query("SELECT * FROM vehicle_images ORDER BY id");
    console.log("Vehicle Images:", images.rows);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
checkData();
