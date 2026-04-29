-- ========================================
-- 1. BASE TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS branches (
    id SERIAL PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL UNIQUE,
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- ========================================
-- 2. USERS & CUSTOMERS
-- ========================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password TEXT,
    role_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    primary_mobile VARCHAR(15) NOT NULL,
    secondary_mobile VARCHAR(15),
    email VARCHAR(100),
    branch_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_customer_mobile ON customers(primary_mobile);

-- ========================================
-- 3. VEHICLES
-- ========================================

CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    created_by INT NOT NULL,
    vehicle_type VARCHAR(100) NOT NULL,
    vehicle_name VARCHAR(100),
    purchase_type VARCHAR(50),
    model_year INT,
    registration_number VARCHAR(20) UNIQUE,
    speedometer_reading INT,
    outlook_condition VARCHAR(50),
    engine_condition VARCHAR(50),
    overall_condition VARCHAR(50),
    noc_status VARCHAR(20),
    challans_pending BOOLEAN DEFAULT false,
    exchange_value NUMERIC(10,2),
    final_credit_note_value NUMERIC(10,2),
    vehicle_status VARCHAR(50) DEFAULT 'INTAKE_CREATED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_vehicle_customer ON vehicles(customer_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_name ON vehicles(vehicle_name);
CREATE INDEX IF NOT EXISTS idx_vehicle_reg ON vehicles(registration_number);
CREATE INDEX IF NOT EXISTS idx_vehicle_year ON vehicles(model_year);
CREATE INDEX IF NOT EXISTS idx_vehicle_status ON vehicles(vehicle_status);

-- ========================================
-- 4. INSPECTIONS
-- ========================================

CREATE TABLE IF NOT EXISTS vehicle_inspections (
    id SERIAL PRIMARY KEY,
    vehicle_id INT NOT NULL,
    inspected_by INT NOT NULL,
    engine_health VARCHAR(50),
    outlook VARCHAR(50),
    structural_condition VARCHAR(50),
    mechanical_condition VARCHAR(50),
    electrical_condition VARCHAR(50),
    overall_grade VARCHAR(20),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (inspected_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_vehicle_inspection_vehicle ON vehicle_inspections(vehicle_id);

CREATE TABLE IF NOT EXISTS inspection_images (
    id SERIAL PRIMARY KEY,
    inspection_id INT NOT NULL,
    image_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inspection_id) REFERENCES vehicle_inspections(id) ON DELETE CASCADE
);

-- ========================================
-- 5. VALUATIONS
-- ========================================

CREATE TABLE IF NOT EXISTS vehicle_valuations (
    id SERIAL PRIMARY KEY,
    vehicle_id INT NOT NULL,
    inspection_id INT NOT NULL,
    evaluated_by INT NOT NULL,
    base_price NUMERIC(10,2),
    final_price NUMERIC(10,2) NOT NULL,
    price_reason TEXT,
    status VARCHAR(20) DEFAULT 'APPROVED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (inspection_id) REFERENCES vehicle_inspections(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluated_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_valuation_vehicle ON vehicle_valuations(vehicle_id);

CREATE TABLE IF NOT EXISTS valuation_history (
    id SERIAL PRIMARY KEY,
    valuation_id INT,
    old_price NUMERIC,
    new_price NUMERIC,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (valuation_id) REFERENCES vehicle_valuations(id) ON DELETE CASCADE
);

-- ========================================
-- 6. INVENTORY
-- ========================================

CREATE TABLE IF NOT EXISTS vehicle_inventory (
    id SERIAL PRIMARY KEY,
    vehicle_id INT NOT NULL,
    valuation_id INT NOT NULL,
    listing_price NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (valuation_id) REFERENCES vehicle_valuations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_inventory_vehicle ON vehicle_inventory(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON vehicle_inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_price ON vehicle_inventory(listing_price);

-- ========================================
-- 7. MEDIA & STATUS
-- ========================================

CREATE TABLE IF NOT EXISTS vehicle_images (
    id SERIAL PRIMARY KEY,
    vehicle_id INT NOT NULL,
    image_path TEXT NOT NULL,
    image_order INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vehicle_main_images (
    id SERIAL PRIMARY KEY,
    vehicle_id INT,
    image_path TEXT,
    is_primary BOOLEAN DEFAULT true,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vehicle_documents (
    id SERIAL PRIMARY KEY,
    vehicle_id INT NOT NULL,
    document_type VARCHAR(50),
    document_path TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vehicle_status_history (
    id SERIAL PRIMARY KEY,
    vehicle_id INT NOT NULL,
    status VARCHAR(50),
    changed_by INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ========================================
-- 8. MASTER OPTIONS
-- ========================================

CREATE TABLE IF NOT EXISTS master_options (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    value VARCHAR(100) NOT NULL,
    CONSTRAINT unique_category_value UNIQUE (category, value)
);

-- ========================================
-- 9. NEW BUSINESS TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    vehicle_id INT,
    created_by INT NOT NULL,
    status VARCHAR(20) DEFAULT 'NEW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS credit_notes (
    id SERIAL PRIMARY KEY,
    vehicle_id INT NOT NULL,
    customer_id INT NOT NULL,
    valuation_id INT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (valuation_id) REFERENCES vehicle_valuations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vehicle_sales (
    id SERIAL PRIMARY KEY,
    vehicle_id INT NOT NULL,
    buyer_customer_id INT NOT NULL,
    selling_price NUMERIC(10,2) NOT NULL,
    profit_margin NUMERIC(10,2),
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    sold_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    sale_id INT NOT NULL,
    amount NUMERIC(10,2),
    payment_method VARCHAR(50),
    payment_status VARCHAR(20),
    paid_at TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES vehicle_sales(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vehicle_reconditioning (
    id SERIAL PRIMARY KEY,
    vehicle_id INT NOT NULL,
    description TEXT,
    cost NUMERIC(10,2),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rc_transfer_tracking (
    id SERIAL PRIMARY KEY,
    vehicle_id INT NOT NULL,
    status VARCHAR(50),
    remarks TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vehicle_notes (
    id SERIAL PRIMARY KEY,
    vehicle_id INT NOT NULL,
    noted_by INT NOT NULL,
    role VARCHAR(50),
    note_text TEXT,
    note_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (noted_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- ========================================
-- 10. INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_leads_customer ON leads(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_vehicle ON vehicle_sales(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_notes_vehicle ON vehicle_notes(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_recond_vehicle ON vehicle_reconditioning(vehicle_id);

-- ========================================
-- 11. TRIGGER FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION auto_insert_inventory()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'APPROVED' THEN
        INSERT INTO vehicle_inventory (vehicle_id, valuation_id, listing_price)
        VALUES (NEW.vehicle_id, NEW.id, NEW.final_price);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_auto_insert_inventory
AFTER UPDATE OF status ON vehicle_valuations
FOR EACH ROW
EXECUTE FUNCTION auto_insert_inventory();